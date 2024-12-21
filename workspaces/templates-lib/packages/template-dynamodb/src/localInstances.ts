/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { debug, error } from '@goldstack/utils-log';
import { DynamoDBInstance } from './localDynamoDB';
import fs from 'fs';
import path from 'path';

/**
 * Interface representing the state that will be persisted to file
 */
interface PersistedState {
  instances: { [port: string]: 'stopped' | { port: number } };
  usageCounts: { [port: string]: number };
}

/**
 * Interface for managing local DynamoDB instances and their usage
 */
export interface LocalInstancesManager {
  /** Get an instance for a specific port if it exists and is running */
  getInstance(port: number): DynamoDBInstance | 'stopped' | undefined;
  /** Get the first running instance if any exists */
  getFirstRunningInstance(): DynamoDBInstance | undefined;
  /** Set an instance for a specific port */
  setInstance(port: number, instance: DynamoDBInstance | 'stopped'): void;
  /** Get all running instances */
  getAllInstances(): Map<number, DynamoDBInstance | 'stopped'>;
  /** Get number of defined instances */
  getInstanceCount(): number;
  /** Increment usage counter for a port */
  incrementUsageCounter(port: number): void;
  /** Decrement usage counter for a port */
  decrementUsageCounter(port: number): number;
  /** Get current usage count for a port */
  getUsageCount(port: number): number;
  /** Remove usage counter for a port */
  removeUsageCounter(port: number): void;
}

/**
 * Implementation of LocalInstancesManager for managing DynamoDB local instances
 */
class LocalInstancesManagerImpl implements LocalInstancesManager {
  private readonly stateFile = '.localInstances.json';
  // Track instances by port instead of table name
  private startedInstances: Map<number, DynamoDBInstance | 'stopped'> =
    new Map();
  // Track number of active users per port
  private portUsageCounter: Map<number, number> = new Map();

  constructor() {
    this.loadState();
  }

  private loadState(): void {
    try {
      const data = fs.readFileSync(this.stateFile, 'utf8');
      const state: PersistedState = JSON.parse(data);

      // Clear existing maps
      this.startedInstances.clear();
      this.portUsageCounter.clear();

      // Restore instances
      Object.entries(state.instances).forEach(([port, instance]) => {
        const portNum = parseInt(port);
        if (instance === 'stopped') {
          this.startedInstances.set(portNum, 'stopped');
        } else {
          // Create a dummy instance that will be replaced when actually started
          this.startedInstances.set(portNum, {
            port: portNum,
            stop: async () => {
              // no-op since this is just a placeholder
            },
          });
        }
      });

      // Restore usage counts
      Object.entries(state.usageCounts).forEach(([port, count]) => {
        this.portUsageCounter.set(parseInt(port), count);
      });
    } catch (err) {
      if (err.code !== 'ENOENT') {
        error('Failed to load local instances state:', err);
      }
      // File doesn't exist yet, that's fine
    }
  }

  private saveState(): void {
    try {
      const state: PersistedState = {
        instances: {},
        usageCounts: {},
      };

      // Save instances
      this.startedInstances.forEach((instance, port) => {
        state.instances[port] =
          instance === 'stopped' ? 'stopped' : { port: instance.port };
      });

      // Save usage counts
      this.portUsageCounter.forEach((count, port) => {
        state.usageCounts[port] = count;
      });

      fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
    } catch (err) {
      error('Failed to save local instances state:', err);
    }
  }

  getInstance(port: number): DynamoDBInstance | 'stopped' | undefined {
    return this.startedInstances.get(port);
  }

  getFirstRunningInstance(): DynamoDBInstance | undefined {
    for (const [port, instance] of this.startedInstances.entries()) {
      if (instance !== 'stopped') {
        debug(`Found existing local DynamoDB instance on port ${port}`);
        return instance;
      }
    }
    return undefined;
  }

  setInstance(port: number, instance: DynamoDBInstance | 'stopped'): void {
    this.startedInstances.set(port, instance);
    debug(
      `DynamoDB local instance ${
        instance === 'stopped' ? 'stopped' : 'started'
      } on port ${port}. Currently defined instances: ${
        this.startedInstances.size
      }`
    );
    this.saveState();
  }

  getAllInstances(): Map<number, DynamoDBInstance | 'stopped'> {
    return this.startedInstances;
  }

  getInstanceCount(): number {
    return this.startedInstances.size;
  }

  incrementUsageCounter(port: number): void {
    this.portUsageCounter.set(port, (this.portUsageCounter.get(port) || 0) + 1);
    this.saveState();
  }

  decrementUsageCounter(port: number): number {
    const currentCount = this.portUsageCounter.get(port) || 0;
    if (currentCount <= 1) {
      this.portUsageCounter.delete(port);
      this.saveState();
      return 0;
    }
    this.portUsageCounter.set(port, currentCount - 1);
    this.saveState();
    return currentCount - 1;
  }

  getUsageCount(port: number): number {
    return this.portUsageCounter.get(port) || 0;
  }

  removeUsageCounter(port: number): void {
    this.portUsageCounter.delete(port);
    this.saveState();
  }
}

// Export singleton instance
export const localInstancesManager = new LocalInstancesManagerImpl();
