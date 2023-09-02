/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import { DynamoDB } from 'aws-sdk';

import dynamoDBLocal from 'dynamo-db-local';
import { commandExists } from '@goldstack/utils-sh';
import { getTableName } from './dynamoDBPackageUtils';
import { DynamoDBDeployment, DynamoDBPackage } from './templateDynamoDB';

import { check } from 'tcp-port-used';

const MAPPED_PORT = 8000;
// const IMAGE_NAME = 'amazon/dynamodb-local:1.21.0';

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
): Promise<DynamoDB> => {
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

export const createClient = (startedContainer: DynamoDBInstance): DynamoDB => {
  const endpoint = endpointUrl(startedContainer);
  return new DynamoDB({
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
  if (commandExists('java') && false) {
    console.debug('Starting local DynamoDB with Java');
    const pr = dynamoDBLocal.spawn({ port: MAPPED_PORT, path: null });
    return {
      port: MAPPED_PORT,
      stop: async () => {
        console.debug('Stopping local Java DynamoDB');
        pr.kill();
      },
    };
  }

  if (commandExists('docker')) {
    console.debug('Starting local DynamoDB with Docker');
    console.warn(
      "Docker doesn't currently support stopping the container, see https://github.com/chrisguttandin/dynamo-db-local/issues/114\nIt is recommended you install Java."
    );
    const detached = window['CI'] ? true : false;
    const pr = dynamoDBLocal.spawn({
      port: MAPPED_PORT,
      command: 'docker',
      path: null,
      detached,
    });
    if (detached) {
      pr.unref();
    }
    return {
      port: MAPPED_PORT,
      stop: async () => {
        pr.kill();
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
