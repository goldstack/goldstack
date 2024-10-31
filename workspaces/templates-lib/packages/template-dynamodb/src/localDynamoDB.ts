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

type DynamoDBTableName = string;

export interface DynamoDBInstance {
  port: number;
  stop: () => Promise<void>;
}

// Define type signatures for the methods
export type LocalConnectType = (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  options: { port: number },
  deploymentName?: string
) => Promise<DynamoDBClient>;

export type StartLocalDynamoDBType = (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  options: { port: number },
  deploymentName?: string
) => Promise<DynamoDBInstance>;

export type StopLocalDynamoDBType = (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName?: string
) => Promise<void>;

function areWeTestingWithJest(): boolean {
  return process.env.JEST_WORKER_ID !== undefined;
}

const startedContainers: Map<DynamoDBTableName, DynamoDBInstance | 'stopped'> =
  new Map();

export const localConnect: LocalConnectType = async (
  packageConfig,
  { port },
  deploymentName
) => {
  if (areWeTestingWithJest()) {
    const tableName = await getTableName(packageConfig, deploymentName);
    const startedContainer = startedContainers.get(tableName);
    if (!startedContainer) {
      throw new Error(
        'DynamoDB Local has not been started. When running Jest test, start Local DynamoDB explicitly with `startLocalDynamoDB` and shut the instance down with `stopLocalDynamoDB` when tests are completed.'
      );
    }
  }

  return createClient(
    await startLocalDynamoDB(packageConfig, { port }, deploymentName)
  );
};

export const endpointUrl = (startedContainer: DynamoDBInstance): string => {
  return `http://localhost:${startedContainer.port}`;
};

export const createClient = (
  startedContainer: DynamoDBInstance
): DynamoDBClient => {
  const endpoint = endpointUrl(startedContainer);
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
  const tableName = await getTableName(packageConfig, deploymentName);

  let startedContainer = startedContainers.get(tableName);
  if (startedContainer && startedContainer !== 'stopped') {
    return startedContainer;
  }
  startedContainer = await spawnLocalDynamoDB(port);

  const startedContainerTest = startedContainers.get(tableName);
  if (startedContainerTest && startedContainerTest !== 'stopped') {
    await startedContainer.stop();
    return startedContainerTest;
  }

  startedContainers.set(tableName, startedContainer);
  return startedContainer;
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

      console.debug(
        `Child process exited with code ${code} and signal ${signal}`
      );
      resolve();
    });
  });
}

const spawnLocalDynamoDB = async (port: number): Promise<DynamoDBInstance> => {
  if (await check(port)) {
    console.debug(
      `Port ${port} is already in use. Assuming another instance of DynamoDB is already running.`
    );
    return {
      port,
      stop: async () => {
        // no op, someone else controls this instance
      },
    };
  }
  if (commandExists('java')) {
    console.debug('Starting local DynamoDB with Java');
    const pr = dynamoDBLocal.spawn({
      port,
      path: null,
      detached: false,
    });
    await waitPort({
      host: 'localhost',
      port,
    });
    console.debug('Started local DynamoDB with Java');
    return {
      port,
      stop: async () => {
        console.debug('Stopping local Java DynamoDB');
        try {
          await killProcess(pr);
        } catch (e) {
          console.error('Stopping local Java DynamoDB process not successful');
          throw e;
        }
        console.debug('Local Java DynamoDB stopped');
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
          await execAsync(`docker stop ${containerName}`);
        } catch (e) {
          console.error(
            'Stopping local Docker DynamoDB process not successful'
          );
          throw e;
        }
        console.debug('Local Docker DynamoDB stopped');
      },
    };
  }

  throw new Error(
    'Either Docker or Java needs to be installed to run local DynamoDB'
  );
};

export const stopLocalDynamoDB: StopLocalDynamoDBType = async (
  packageConfig,
  deploymentName
) => {
  const tableName = await getTableName(packageConfig, deploymentName);
  const startedContainer = startedContainers.get(tableName);
  if (!startedContainer) {
    throw new Error(
      `Attempting to stop container that has not been started for DynamoDB table ${tableName}`
    );
  }
  if (startedContainer === 'stopped') {
    return;
  }
  startedContainers.set(tableName, 'stopped');
  await startedContainer.stop();
};
