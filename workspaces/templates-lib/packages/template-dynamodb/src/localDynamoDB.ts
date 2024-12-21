/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import * as dynamoDBLocal from 'dynamo-db-local';
import { commandExists, execAsync } from '@goldstack/utils-sh';
import { getTableName } from './dynamoDBPackageUtils';
import { DynamoDBDeployment, DynamoDBPackage } from './templateDynamoDB';
import waitPort from 'wait-port';
import { check } from 'tcp-port-used';
import { ChildProcess, spawn } from 'child_process';

import { debug, error, info, warn } from '@goldstack/utils-log';

export interface DynamoDBInstance {
  port: number;
  stop: () => Promise<void>;
}

// Track instances by port instead of table name
const startedInstances: Map<number, DynamoDBInstance | 'stopped'> = new Map();

// Track number of active users per port
const portUsageCounter: Map<number, number> = new Map();

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
  // Check if any instance is running
  for (const [port, instance] of startedInstances.entries()) {
    if (instance !== 'stopped') {
      debug(`Connecting to existing local DynamoDB instance on port ${port}`);
      return createClient(instance);
    }
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
  const existingInstance = startedInstances.get(port);
  if (existingInstance && existingInstance !== 'stopped') {
    debug(
      `Starting DynamoDB local not required since instance already running on port ${port}`
    );
    // Increment usage counter
    portUsageCounter.set(port, (portUsageCounter.get(port) || 0) + 1);
    return existingInstance;
  }

  // Check if any instance is already running on a different port
  for (const [existingPort, instance] of startedInstances.entries()) {
    if (instance !== 'stopped') {
      warn(`You are starting a new DynamoDB instance on port ${port}. But a local DynamoDB instance is already running on port ${existingPort}.
        It is recommended to have only one instance of local DynamoDB running at a time (since one instance can support multiple tables).`);
      // debug(`Using existing DynamoDB instance on port ${existingPort}`);
      // return instance;
    }
  }

  debug(`Starting new DynamoDB local instance on port ${port}`);
  // No running instance found, start a new one
  const newInstance = await spawnLocalDynamoDB(port);
  startedInstances.set(port, newInstance);
  // Initialize usage counter
  portUsageCounter.set(port, 1);
  debug(
    `DynamoDB local instance started on port ${port}. Currently defined instances: ${startedInstances.size}`
  );
  return newInstance;
};

function killProcess(childProcess: ChildProcess): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (process.platform === 'win32') {
      if (!childProcess.pid) {
        throw new Error('Process id cannot be identified.');
      }
      spawn('taskkill', ['/pid', childProcess.pid?.toString(), '/t']);
    } else {
      childProcess.kill('SIGTERM');
    }
    const timeout = setTimeout(() => {
      if (process.platform === 'win32') {
        if (!childProcess.pid) {
          throw new Error('Process id cannot be identified.');
        }
        spawn('taskkill', ['/pid', childProcess.pid?.toString(), '/f', '/t']);
      } else {
        childProcess.kill('SIGKILL');
      }
    }, 5000);

    const errorTimeout = setTimeout(() => {
      clearTimeout(timeout);
      reject(new Error('Process could not be terminated after 30 s'));
    }, 30000);
    childProcess.on('exit', (code, signal) => {
      clearTimeout(timeout);
      clearTimeout(errorTimeout);

      debug(
        `DynamoDB child process exited with code ${code} and signal ${signal}`
      );
      resolve();
    });
  });
}

const spawnLocalDynamoDB = async (port: number): Promise<DynamoDBInstance> => {
  if (await check(port)) {
    warn(
      `Port ${port} is already in use. Assuming another instance of DynamoDB is already running.`
    );
    return {
      port,
      stop: async () => {
        // no op, someone else controls this instance
      },
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
      stop: async () => {
        info(`Stopping local Java DynamoDB on port ${port}`);
        try {
          await killProcess(pr);
        } catch (e) {
          error('Stopping local Java DynamoDB process not successful');
          throw e;
        }
        info(`Local Java DynamoDB stopped on port ${port}`);
      },
    };
  }

  if (commandExists('docker')) {
    console.debug('Starting local DynamoDB with Docker');
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
      stop: async () => {
        console.debug('Stopping local Docker DynamoDB');
        try {
          await killProcess(pr);
          const containersAfterKillProcess = await execAsync(
            'docker container ls',
            {
              silent: true,
            }
          );
          if (containersAfterKillProcess.indexOf(containerName) !== -1) {
            await execAsync(`docker stop ${containerName}`);
          }
        } catch (e) {
          error('Stopping local Docker DynamoDB process not successful');
          throw e;
        }
        info('Local Docker DynamoDB stopped');
      },
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
      startedInstances.size
  );
  // Stop all running instances regardless of reference count
  for (const [port, instance] of startedInstances.entries()) {
    if (instance && instance !== 'stopped') {
      debug(`Stopping instance on port ${port}`);
      startedInstances.set(port, 'stopped');
      portUsageCounter.delete(port);
      await instance.stop();
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
  const instance = startedInstances.get(portToStop);
  if (instance && instance !== 'stopped') {
    // Decrement usage counter
    const currentCount = portUsageCounter.get(portToStop) || 0;
    if (currentCount <= 1) {
      // Last user, stop the instance
      startedInstances.set(portToStop, 'stopped');
      portUsageCounter.delete(portToStop);
      await instance.stop();
    } else {
      // Decrement counter
      portUsageCounter.set(portToStop, currentCount - 1);
    }
  }
};
