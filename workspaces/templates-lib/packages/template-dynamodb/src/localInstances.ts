/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { debug } from '@goldstack/utils-log';
import { DynamoDBInstance } from './localDynamoDB';

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
  // Track instances by port instead of table name
  private startedInstances: Map<number, DynamoDBInstance | 'stopped'> =
    new Map();
  // Track number of active users per port
  private portUsageCounter: Map<number, number> = new Map();

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
  }

  getAllInstances(): Map<number, DynamoDBInstance | 'stopped'> {
    return this.startedInstances;
  }

  getInstanceCount(): number {
    return this.startedInstances.size;
  }

  incrementUsageCounter(port: number): void {
    this.portUsageCounter.set(port, (this.portUsageCounter.get(port) || 0) + 1);
  }

  decrementUsageCounter(port: number): number {
    const currentCount = this.portUsageCounter.get(port) || 0;
    if (currentCount <= 1) {
      this.portUsageCounter.delete(port);
      return 0;
    }
    this.portUsageCounter.set(port, currentCount - 1);
    return currentCount - 1;
  }

  getUsageCount(port: number): number {
    return this.portUsageCounter.get(port) || 0;
  }

  removeUsageCounter(port: number): void {
    this.portUsageCounter.delete(port);
  }
}

// Export singleton instance
export const localInstancesManager = new LocalInstancesManagerImpl();
