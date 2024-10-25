/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import * as dynamoDBLocal from 'dynamo-db-local';
import { commandExists, execAsync } from '@goldstack/utils-sh';
import { getTableName } from './dynamoDBPackageUtils';
import { DynamoDBDeployment, DynamoDBPackage } from './templateDynamoDB';
import waitPort from 'wait-port';
import { check } from 'tcp-port-used';
import { ChildProcess, exec, spawn } from 'child_process';

const MAPPED_PORT = 8000;

type DynamoDBTableName = string;

export interface DynamoDBInstance {
  port: number;
  stop: () => Promise<void>;
}

function areWeTestingWithJest(): boolean {
  return process.env.JEST_WORKER_ID !== undefined;
}

const startedContainers: Map<DynamoDBTableName, DynamoDBInstance | 'stopped'> =
  new Map();

export const localConnect = async (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName?: string
): Promise<DynamoDBClient> => {
  if (areWeTestingWithJest()) {
    const tableName = await getTableName(packageConfig, deploymentName);
    const startedContainer = startedContainers.get(tableName);
    if (!startedContainer) {
      throw new Error(
        'DynamoDB Local has not been started. When running Jest test, start Local DynamoDB explicitly with `startLocalDynamoDB` and shut the instance down with `stopLocalDynamoDB` when tests are completed.'
      );
    }
  }

  return createClient(await startLocalDynamoDB(packageConfig, deploymentName));
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

export const startLocalDynamoDB = async (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName?: string
): Promise<DynamoDBInstance> => {
  const tableName = await getTableName(packageConfig, deploymentName);

  // TODO the key in this map may need to be extended to include the region as well, since dynamodb table names are unique per region.
  let startedContainer = startedContainers.get(tableName);
  if (startedContainer && startedContainer !== 'stopped') {
    return startedContainer;
  }
  startedContainer = await spawnLocalDynamoDB();

  // Check if another container for this table has already been started in the meanwhile
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
      // Send SIGTERM signal to the process
      childProcess.kill('SIGTERM');
    }
    // Set a timeout to send SIGKILL after 5 seconds
    const timeout = setTimeout(() => {
      if (process.platform === 'win32') {
        if (!childProcess.pid) {
          throw new Error('Process id cannot be identified.');
        }
        spawn('taskkill', ['/pid', childProcess.pid?.toString(), '/f', '/t']);
      } else {
        // Send SIGKILL signal if the process hasn't exited after 5 seconds
        childProcess.kill('SIGKILL');
      }
    }, 5000);

    const errorTimeout = setTimeout(() => {
      clearTimeout(timeout);
      reject(new Error('Process could not be terminated after 30 s'));
    }, 30000);
    // Listen for the exit event
    childProcess.on('exit', (code, signal) => {
      // Clear the timeouts since the process has exited
      clearTimeout(timeout);
      clearTimeout(errorTimeout);

      console.debug(
        `Child process exited with code ${code} and signal ${signal}`
      );
      resolve();
    });
  });
}

const spawnLocalDynamoDB = async (): Promise<DynamoDBInstance> => {
  if (await check(MAPPED_PORT)) {
    console.debug(
      `Port ${MAPPED_PORT} is already in use. Assuming another instance of DynamoDB is already running.`
    );
    return {
      port: MAPPED_PORT,
      stop: async () => {
        // no op, someone else controls this instance
      },
    };
  }
  if (commandExists('java')) {
    console.debug('Starting local DynamoDB with Java');
    const pr = dynamoDBLocal.spawn({
      port: MAPPED_PORT,
      path: null,
      detached: false,
    });
    await waitPort({
      host: 'localhost',
      port: MAPPED_PORT,
    });
    console.debug('Started local DynamoDB with Java');
    return {
      port: MAPPED_PORT,
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
    console.warn(
      "Docker doesn't currently support stopping the container, see https://github.com/chrisguttandin/dynamo-db-local/issues/114\nIt is recommended you install Java."
    );
    const detached = global['CI'] ? true : false;
    const hash = new Date().getTime();
    const containerName = 'goldstack-local-dynamodb-' + hash;
    const pr = dynamoDBLocal.spawn({
      port: MAPPED_PORT,
      command: 'docker',
      name: containerName,
      path: null,
      detached,
    });
    if (detached) {
      pr.unref();
    }
    return {
      port: MAPPED_PORT,
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

export const stopLocalDynamoDB = async (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName?: string
): Promise<void> => {
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
