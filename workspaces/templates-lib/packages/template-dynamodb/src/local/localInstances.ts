/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { debug, error } from '@goldstack/utils-log';
import { DynamoDBInstance } from './localDynamoDB';
import fs from 'fs';
import { check } from 'tcp-port-used';

/**
 * Interface representing the state that will be persisted to file
 */
interface PersistedState {
  instances: {
    [port: string]:
      | 'stopped'
      | {
          port: number;
          processId?: number;
          dockerContainerId?: string;
        };
  };
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

  private constructor() {
    // Private constructor for factory method pattern
  }

  /**
   * Creates and initializes a new LocalInstancesManagerImpl instance
   */
  public static async create(): Promise<LocalInstancesManagerImpl> {
    const manager = new LocalInstancesManagerImpl();
    await manager.loadState();
    return manager;
  }

  private async loadState(): Promise<void> {
    try {
      const data = fs.readFileSync(this.stateFile, 'utf8');
      const state: PersistedState = JSON.parse(data);

      // Clear existing maps
      this.startedInstances.clear();
      this.portUsageCounter.clear();

      // Restore instances
      for (const [port, instance] of Object.entries(state.instances)) {
        const portNum = parseInt(port);
        if (instance === 'stopped') {
          this.startedInstances.set(portNum, 'stopped');
        } else {
          // Check if port is actually in use
          const isPortInUse = await check(portNum);
          if (!isPortInUse) {
            debug(`Port ${portNum} not in use, marking instance as stopped`);
            this.startedInstances.set(portNum, 'stopped');
          } else {
            // Restore instance with its process/container info
            this.startedInstances.set(portNum, {
              port: portNum,
              processId: instance.processId,
              dockerContainerId: instance.dockerContainerId,
            });
          }
        }
      }

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
          instance === 'stopped'
            ? 'stopped'
            : {
                port: instance.port,
                processId: instance.processId,
                dockerContainerId: instance.dockerContainerId,
              };
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
      }`,
      {
        definedInstances: this.startedInstances.size,
        stoppedInstances: [...this.startedInstances.entries()].filter(
          (e) => e[1] === 'stopped'
        ).length,
        allInstances: [...this.startedInstances.entries()],
      }
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

// Initialize singleton instance
let localInstancesManagerInstance: LocalInstancesManagerImpl | undefined;

/**
 * Gets the singleton instance of LocalInstancesManager, initializing it if necessary
 */
export async function getLocalInstancesManager(): Promise<LocalInstancesManager> {
  if (!localInstancesManagerInstance) {
    localInstancesManagerInstance = await LocalInstancesManagerImpl.create();
  }
  return localInstancesManagerInstance;
}

// For backward compatibility, initialize immediately but without waiting
// This maintains the existing behavior while allowing proper async initialization when needed
LocalInstancesManagerImpl.create().then((instance) => {
  localInstancesManagerInstance = instance;
});

export const localInstancesManager = {} as LocalInstancesManager;
Object.defineProperties(localInstancesManager, {
  getInstance: {
    get: () =>
      localInstancesManagerInstance?.getInstance.bind(
        localInstancesManagerInstance
      ),
  },
  getFirstRunningInstance: {
    get: () =>
      localInstancesManagerInstance?.getFirstRunningInstance.bind(
        localInstancesManagerInstance
      ),
  },
  setInstance: {
    get: () =>
      localInstancesManagerInstance?.setInstance.bind(
        localInstancesManagerInstance
      ),
  },
  getAllInstances: {
    get: () =>
      localInstancesManagerInstance?.getAllInstances.bind(
        localInstancesManagerInstance
      ),
  },
  getInstanceCount: {
    get: () =>
      localInstancesManagerInstance?.getInstanceCount.bind(
        localInstancesManagerInstance
      ),
  },
  incrementUsageCounter: {
    get: () =>
      localInstancesManagerInstance?.incrementUsageCounter.bind(
        localInstancesManagerInstance
      ),
  },
  decrementUsageCounter: {
    get: () =>
      localInstancesManagerInstance?.decrementUsageCounter.bind(
        localInstancesManagerInstance
      ),
  },
  getUsageCount: {
    get: () =>
      localInstancesManagerInstance?.getUsageCount.bind(
        localInstancesManagerInstance
      ),
  },
  removeUsageCounter: {
    get: () =>
      localInstancesManagerInstance?.removeUsageCounter.bind(
        localInstancesManagerInstance
      ),
  },
});
