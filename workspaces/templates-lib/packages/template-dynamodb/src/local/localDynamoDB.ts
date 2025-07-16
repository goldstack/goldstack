import type { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { debug, warn } from '@goldstack/utils-log';
import { getInstanceManager } from './instanceManager';
import { defaultConfig, getEndpointUrl, isTestEnvironment } from './config';
import { spawnInstance } from './spawner';
import type { DynamoDBPackage, DynamoDBDeployment } from '../types/DynamoDBPackage';

export interface DynamoDBInstance {
  port: number;
  processId?: number;
  dockerContainerId?: string;
}

// Define type signatures for the methods
export type LocalConnectType = (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName?: string,
) => Promise<DynamoDBClient>;

export type StartLocalDynamoDBType = (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  options: { port: number },
  deploymentName?: string,
) => Promise<DynamoDBInstance>;

export interface StopLocalDynamoDBOptions {
  port?: number;
}

export type StopLocalDynamoDBType = (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  options?: StopLocalDynamoDBOptions,
  deploymentName?: string,
) => Promise<void>;

export type StopAllLocalDynamoDBType = (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName?: string,
) => Promise<void>;

/**
 * Creates a DynamoDB client for a local instance
 */
async function createClient(instance: DynamoDBInstance): Promise<DynamoDBClient> {
  const endpoint = getEndpointUrl(instance.port);
  debug(`Connecting to local DynamoDB instance on endpoint: ${endpoint}`);
  return new DynamoDBClient({
    endpoint,
    region: defaultConfig.region,
    credentials: defaultConfig.credentials,
  });
}

/**
 * Connects to a local DynamoDB instance, starting one if necessary
 */
export const localConnect: LocalConnectType = async (packageConfig, deploymentName) => {
  const manager = await getInstanceManager();
  const existingInstance = await manager.getFirstRunningInstance();
  if (existingInstance) {
    return await createClient(existingInstance);
  }

  if (isTestEnvironment()) {
    throw new Error(
      'DynamoDB Local has not been started. When running Jest test, start Local DynamoDB explicitly with `startLocalDynamoDB` and shut the instance down with `stopLocalDynamoDB` when tests are completed.',
    );
  }

  // No running instance found, start a new one
  const newInstance = await startLocalDynamoDB(
    packageConfig,
    { port: defaultConfig.port },
    deploymentName,
  );
  return await createClient(newInstance);
};

/**
 * Starts a local DynamoDB instance
 */
export const startLocalDynamoDB: StartLocalDynamoDBType = async (
  packageConfig,
  { port },
  deploymentName,
) => {
  const manager = await getInstanceManager();

  // Check if instance already exists on requested port
  const existingInstance = await manager.getInstance(port);
  if (existingInstance && existingInstance !== 'stopped') {
    debug(`Starting DynamoDB local not required since instance already running on port ${port}`);
    manager.incrementUsageCounter(port);
    return existingInstance;
  }

  // Check if any instance is already running on a different port
  const allInstances = manager.getAllInstances();
  for (const [existingPort, instance] of allInstances.entries()) {
    if (instance !== 'stopped') {
      warn(`You are starting a new DynamoDB instance on port ${port}. But a local DynamoDB instance is already running on port ${existingPort}.
        It is recommended to have only one instance of local DynamoDB running at a time (since one instance can support multiple tables).`);
    }
  }

  debug(`Starting new DynamoDB local instance on port ${port}`);
  const newInstance = await spawnInstance({ port });
  manager.setInstance(port, newInstance);
  manager.incrementUsageCounter(port);
  return newInstance;
};

/**
 * Stops all local DynamoDB instances
 */
export const stopAllLocalDynamoDB: StopAllLocalDynamoDBType = async (
  packageConfig,
  deploymentName,
) => {
  const manager = await getInstanceManager();
  debug('Stopping all local DynamoDB instances. Currently defined: ' + manager.getInstanceCount());

  const allInstances = manager.getAllInstances();
  for (const [port, instance] of allInstances.entries()) {
    if (instance && instance !== 'stopped') {
      debug(`Stopping instance on port ${port}`);
      manager.setInstance(port, 'stopped');
      manager.removeUsageCounter(port);
      await manager.stopInstance(instance);
    }
  }
};

/**
 * Stops a specific local DynamoDB instance
 */
export const stopLocalDynamoDB: StopLocalDynamoDBType = async (
  packageConfig,
  options,
  deploymentName,
) => {
  const manager = await getInstanceManager();
  const portToStop = options?.port ?? defaultConfig.port;

  const instance = await manager.getInstance(portToStop);
  if (instance && instance !== 'stopped') {
    const remainingUsers = manager.decrementUsageCounter(portToStop);
    if (remainingUsers === 0) {
      // Last user, stop the instance
      manager.setInstance(portToStop, 'stopped');
      await manager.stopInstance(instance);
    }
  }
};
