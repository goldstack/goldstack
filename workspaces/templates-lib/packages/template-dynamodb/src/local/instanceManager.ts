import { debug, error, info, warn } from '@goldstack/utils-log';
import fs from 'fs';
import { check } from 'tcp-port-used';
import type { DynamoDBInstance } from './localDynamoDB';
import { stopContainer, terminateProcess } from './processManager';

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

let localMessageShown = false;

/**
 * Manages DynamoDB instance lifecycle and state
 */
export class InstanceManager {
  private readonly stateFile = '.localInstances.json';
  private instances: Map<number, DynamoDBInstance | 'stopped'> = new Map();
  private usageCounts: Map<number, number> = new Map();

  private constructor() {}

  /**
   * Creates and initializes a new InstanceManager
   */
  public static async create(): Promise<InstanceManager> {
    const manager = new InstanceManager();
    await manager.loadState();
    return manager;
  }

  /**
   * Gets an instance for a specific port
   */
  async getInstance(port: number): Promise<DynamoDBInstance | 'stopped' | undefined> {
    const instance = this.instances.get(port);
    if (instance && instance !== 'stopped') {
      const isPortInUse = await check(port);
      if (!isPortInUse) {
        debug(`Port ${port} not in use, marking instance as stopped`);
        this.setInstance(port, 'stopped');
        return 'stopped';
      }
    }
    return instance;
  }

  /**
   * Gets the first running instance
   */
  async getFirstRunningInstance(): Promise<DynamoDBInstance | undefined> {
    for (const [port, instance] of this.instances.entries()) {
      if (instance !== 'stopped') {
        const isPortInUse = await check(port);
        if (!isPortInUse) {
          debug(`Port ${port} not in use, marking instance as stopped`);
          this.setInstance(port, 'stopped');
          continue;
        }
        if (!localMessageShown) {
          debug(`Found existing local DynamoDB instance on port ${port}`);
          localMessageShown = true;
        }

        return instance;
      }
    }
    return undefined;
  }

  /**
   * Sets an instance for a specific port
   */
  setInstance(port: number, instance: DynamoDBInstance | 'stopped'): void {
    this.instances.set(port, instance);
    debug(
      `DynamoDB local instance ${
        instance === 'stopped' ? 'stopped' : 'started'
      } on port ${port}. Currently defined instances: ${this.instances.size}`,
      {
        definedInstances: this.instances.size,
        stoppedInstances: [...this.instances.entries()].filter((e) => e[1] === 'stopped').length,
        allInstances: [...this.instances.entries()],
      },
    );
    this.saveState();
  }

  /**
   * Gets all instances
   */
  getAllInstances(): Map<number, DynamoDBInstance | 'stopped'> {
    return this.instances;
  }

  /**
   * Gets the number of instances
   */
  getInstanceCount(): number {
    return this.instances.size;
  }

  /**
   * Increments the usage counter for a port
   */
  incrementUsageCounter(port: number): void {
    this.usageCounts.set(port, (this.usageCounts.get(port) || 0) + 1);
    this.saveState();
  }

  /**
   * Decrements the usage counter for a port
   */
  decrementUsageCounter(port: number): number {
    const currentCount = this.usageCounts.get(port) || 0;
    if (currentCount <= 1) {
      this.usageCounts.delete(port);
      this.saveState();
      return 0;
    }
    this.usageCounts.set(port, currentCount - 1);
    this.saveState();
    return currentCount - 1;
  }

  /**
   * Gets the usage count for a port
   */
  getUsageCount(port: number): number {
    return this.usageCounts.get(port) || 0;
  }

  /**
   * Removes the usage counter for a port
   */
  removeUsageCounter(port: number): void {
    this.usageCounts.delete(port);
    this.saveState();
  }

  /**
   * Stops an instance
   */
  async stopInstance(instance: DynamoDBInstance): Promise<void> {
    try {
      if (instance.processId) {
        await terminateProcess(instance.processId);
      } else if (instance.dockerContainerId) {
        await stopContainer(instance.dockerContainerId);
      }
    } catch (e) {
      if (e.code === 'ESRCH' || e.code === 'esrch') {
        info(
          `Process ${instance.processId} already terminated. Cannot stop this DynamoDB instance since it is already stopped.`,
        );
        return;
      }
      warn(
        `Failed to stop local DynamoDB instance: ${e.message}. It may already have been stopped.`,
        {
          message: e.message,
          stack: e.stack,
          code: e.code,
        },
      );
    }
  }

  private async loadState(): Promise<void> {
    try {
      const data = fs.readFileSync(this.stateFile, 'utf8');
      const state: PersistedState = JSON.parse(data);

      // Clear existing maps
      this.instances.clear();
      this.usageCounts.clear();

      // Restore instances
      for (const [port, instance] of Object.entries(state.instances)) {
        const portNum = parseInt(port, 10);
        if (instance === 'stopped') {
          this.instances.set(portNum, 'stopped');
        } else {
          // Check if port is actually in use
          const isPortInUse = await check(portNum);
          if (!isPortInUse) {
            debug(`Port ${portNum} not in use, marking instance as stopped`);
            this.instances.set(portNum, 'stopped');
          } else {
            this.instances.set(portNum, {
              port: portNum,
              processId: instance.processId,
              dockerContainerId: instance.dockerContainerId,
            });
          }
        }
      }

      // Restore usage counts
      Object.entries(state.usageCounts).forEach(([port, count]) => {
        this.usageCounts.set(parseInt(port, 10), count);
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
      this.instances.forEach((instance, port) => {
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
      this.usageCounts.forEach((count, port) => {
        state.usageCounts[port] = count;
      });

      fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
    } catch (err) {
      error('Failed to save local instances state:', err);
    }
  }
}

// Initialize singleton instance
let instanceManagerInstance: InstanceManager | undefined;

/**
 * Gets the singleton instance of InstanceManager
 */
export async function getInstanceManager(): Promise<InstanceManager> {
  if (!instanceManagerInstance) {
    instanceManagerInstance = await InstanceManager.create();
  }
  return instanceManagerInstance;
}
