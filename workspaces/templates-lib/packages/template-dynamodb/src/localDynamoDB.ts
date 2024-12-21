/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import * as dynamoDBLocal from 'dynamo-db-local';
import { commandExists, execAsync } from '@goldstack/utils-sh';
import { getTableName } from './dynamoDBPackageUtils';
import { DynamoDBDeployment, DynamoDBPackage } from './templateDynamoDB';
import waitPort from 'wait-port';
import { check } from 'tcp-port-used';
import { ChildProcess, spawn, spawnSync } from 'child_process';

import { debug, error, info, warn } from '@goldstack/utils-log';
import { localInstancesManager } from './localInstances';

export interface DynamoDBInstance {
  port: number;
  processId?: number;
  dockerContainerId?: string;
}

export async function stopInstance(instance: DynamoDBInstance): Promise<void> {
  if (instance.processId) {
    if (process.platform === 'win32') {
      // Try graceful termination first
      const result = spawnSync('taskkill', [
        '/pid',
        instance.processId.toString(),
        '/t',
      ]);
      if (result.status !== 0) {
        warn(
          `Failed to terminate process ${instance.processId} gracefully: ${result.stderr}`
        );
      }
      // Give it some time before force kill
      await new Promise<void>((resolve) => setTimeout(resolve, 5000));
      // Force kill
      const forceResult = spawnSync('taskkill', [
        '/pid',
        instance.processId.toString(),
        '/f',
        '/t',
      ]);
      if (forceResult.status !== 0) {
        error(
          `Failed to force kill process ${instance.processId}: ${forceResult.stderr}`
        );
        throw new Error(`Failed to terminate process ${instance.processId}`);
      }
    } else {
      try {
        // Try graceful termination first
        process.kill(instance.processId, 'SIGTERM');
        // Give it some time before force kill
        await new Promise<void>((resolve) => setTimeout(resolve, 5000));

        // Check if process still exists
        try {
          process.kill(instance.processId, 0); // Signal 0 is used to check existence
          // Process still exists, try force kill
          process.kill(instance.processId, 'SIGKILL');

          // Wait a moment and verify process is gone
          await new Promise<void>((resolve) => setTimeout(resolve, 1000));
          try {
            process.kill(instance.processId, 0);
            // If we get here, process still exists
            error(
              `Failed to terminate process ${instance.processId} after SIGKILL`
            );
            throw new Error(
              `Process ${instance.processId} could not be terminated`
            );
          } catch (e) {
            if ((e as NodeJS.ErrnoException).code === 'ESRCH') {
              // Process successfully terminated
              debug(`Process ${instance.processId} successfully terminated`);
            } else {
              throw e;
            }
          }
        } catch (e) {
          if ((e as NodeJS.ErrnoException).code === 'ESRCH') {
            // Process already terminated after SIGTERM
            debug(`Process ${instance.processId} terminated gracefully`);
          } else {
            throw e;
          }
        }
      } catch (e) {
        error(`Failed to terminate process ${instance.processId}: ${e}`);
        throw e;
      }
    }
  } else if (instance.dockerContainerId) {
    await execAsync(`docker stop ${instance.dockerContainerId}`);
  }
}

// Define type signatures for the methods
export type LocalConnectType = (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName?: string
) => Promise<DynamoDBClient>;

export type StartLocalDynamoDBType = (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  options: { port: number },
  deploymentName?: string
) => Promise<DynamoDBInstance>;

export interface StopLocalDynamoDBOptions {
  port?: number;
}

export type StopLocalDynamoDBType = (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  options?: StopLocalDynamoDBOptions,
  deploymentName?: string
) => Promise<void>;

export type StopAllLocalDynamoDBType = (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName?: string
) => Promise<void>;

function areWeTestingWithJest(): boolean {
  return process.env.JEST_WORKER_ID !== undefined;
}

export const localConnect: LocalConnectType = async (
  packageConfig,
  deploymentName
) => {
  const existingInstance = localInstancesManager.getFirstRunningInstance();
  if (existingInstance) {
    return createClient(existingInstance);
  }

  if (areWeTestingWithJest()) {
    throw new Error(
      'DynamoDB Local has not been started. When running Jest test, start Local DynamoDB explicitly with `startLocalDynamoDB` and shut the instance down with `stopLocalDynamoDB` when tests are completed.'
    );
  }

  const portToUse =
    (process.env.DYNAMODB_LOCAL_PORT &&
      parseInt(process.env.DYNAMODB_LOCAL_PORT)) ||
    8000;
  debug(`Starting new local DynamoDB instance on port ${portToUse}.`);
  // No running instance found, start a new one
  const newInstance = await startLocalDynamoDB(
    packageConfig,
    { port: portToUse },
    deploymentName
  );
  return createClient(newInstance);
};

export const endpointUrl = (startedContainer: DynamoDBInstance): string => {
  const result = `http://127.0.0.1:${startedContainer.port}`;

  return result;
};

export const createClient = (
  startedContainer: DynamoDBInstance
): DynamoDBClient => {
  const endpoint = endpointUrl(startedContainer);
  debug(`Connecting to local DynamoDB instance on endpoint: ${endpoint}`);
  return new DynamoDBClient({
    endpoint,
    region: 'eu-central-1',
    credentials: {
      accessKeyId: 'dummy',
      secretAccessKey: 'dummy',
    },
  });
};

export const startLocalDynamoDB: StartLocalDynamoDBType = async (
  packageConfig,
  { port },
  deploymentName
) => {
  // Check if instance already exists on requested port
  const existingInstance = localInstancesManager.getInstance(port);
  if (existingInstance && existingInstance !== 'stopped') {
    debug(
      `Starting DynamoDB local not required since instance already running on port ${port}`
    );
    localInstancesManager.incrementUsageCounter(port);
    return existingInstance;
  }

  // Check if any instance is already running on a different port
  const allInstances = localInstancesManager.getAllInstances();
  for (const [existingPort, instance] of allInstances.entries()) {
    if (instance !== 'stopped') {
      warn(`You are starting a new DynamoDB instance on port ${port}. But a local DynamoDB instance is already running on port ${existingPort}.
        It is recommended to have only one instance of local DynamoDB running at a time (since one instance can support multiple tables).`);
    }
  }

  debug(`Starting new DynamoDB local instance on port ${port}`);
  // No running instance found, start a new one
  const newInstance = await spawnLocalDynamoDB(port);
  localInstancesManager.setInstance(port, newInstance);
  localInstancesManager.incrementUsageCounter(port);
  return newInstance;
};

const spawnLocalDynamoDB = async (port: number): Promise<DynamoDBInstance> => {
  if (await check(port)) {
    warn(
      `Port ${port} is already in use. Assuming another instance of DynamoDB is already running.`
    );
    return {
      port,
    };
  }

  let javaViable = commandExists('java');

  if (javaViable) {
    try {
      await execAsync('java -version');
    } catch (e) {
      warn(
        "'java' command is available but it does not work. This is common on never versions of Mac OS X without Java installed.\n" +
          'To use Java, please install it.'
      );
      javaViable = false;
    }
  }

  if (javaViable) {
    info(`Starting local DynamoDB with Java on port ${port}`);
    const pr = dynamoDBLocal.spawn({
      port,
      path: null,
      detached: false,
    });

    if (!pr.pid) {
      throw new Error('Process id cannot be identified.');
    }

    await Promise.all([
      await waitPort({
        host: 'localhost',
        port,
        output: 'silent',
      }),
      await new Promise<void>((resolve) => {
        pr.stdout.once('data', () => resolve());
      }),
    ]);
    info(`Started local DynamoDB with Java on port ${port}`);
    return {
      port,
      processId: pr.pid,
    };
  }

  if (commandExists('docker')) {
    info('Starting local DynamoDB with Docker');
    const detached = global['CI'] ? true : false;
    const hash = new Date().getTime();
    const containerName = 'goldstack-local-dynamodb-' + hash;
    const pr = dynamoDBLocal.spawn({
      port,
      command: 'docker',
      name: containerName,
      path: null,
      detached,
    });
    if (detached) {
      pr.unref();
    }
    await waitPort({
      host: 'localhost',
      port,
      output: 'silent',
    });
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 5000);
    });
    return {
      port,
      dockerContainerId: containerName,
    };
  }

  throw new Error(
    'Either Docker or Java needs to be installed to run local DynamoDB'
  );
};

export const stopAllLocalDynamoDB: StopAllLocalDynamoDBType = async (
  packageConfig,
  deploymentName
) => {
  debug(
    'Stopping all local DynamoDB instances. Currently defined: ' +
      localInstancesManager.getInstanceCount()
  );
  // Stop all running instances regardless of reference count
  const allInstances = localInstancesManager.getAllInstances();
  for (const [port, instance] of allInstances.entries()) {
    if (instance && instance !== 'stopped') {
      debug(`Stopping instance on port ${port}`);
      localInstancesManager.setInstance(port, 'stopped');
      localInstancesManager.removeUsageCounter(port);
      await stopInstance(instance);
    }
  }
};

export const stopLocalDynamoDB: StopLocalDynamoDBType = async (
  packageConfig,
  options,
  deploymentName
) => {
  // If no port specified, use default port
  const defaultPort =
    (process.env.DYNAMODB_LOCAL_PORT &&
      parseInt(process.env.DYNAMODB_LOCAL_PORT)) ||
    8000;
  const portToStop = options?.port ?? defaultPort;

  // Stop specific instance
  const instance = localInstancesManager.getInstance(portToStop);
  if (instance && instance !== 'stopped') {
    const remainingUsers =
      localInstancesManager.decrementUsageCounter(portToStop);
    if (remainingUsers === 0) {
      // Last user, stop the instance
      localInstancesManager.setInstance(portToStop, 'stopped');
      await stopInstance(instance);
    }
  }
};
