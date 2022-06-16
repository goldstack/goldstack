/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import { DynamoDB } from 'aws-sdk';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

import { getTableName } from './dynamoDBPackageUtils';
import { DynamoDBDeployment, DynamoDBPackage } from './templateDynamoDB';

const MAPPED_PORT = 8000;
const IMAGE_NAME = 'amazon/dynamodb-local:1.18.0';

type DynamoDBTableName = string;

const startedContainers: Map<
  DynamoDBTableName,
  StartedTestContainer | 'stopped'
> = new Map();

export const localConnect = async (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName?: string
): Promise<DynamoDB> => {
  console.log('starting local');
  const tableName = await getTableName(packageConfig, deploymentName);

  // TODO the key in this map may need to be extended to include the region as well, since dynamodb table names are unique per region.
  let startedContainer = startedContainers.get(tableName);
  if (startedContainer && startedContainer !== 'stopped') {
    return createClient(startedContainer);
  }
  startedContainer = await startContainer();

  console.log('container started');
  // Check if another container for this table has already been started in the meanwhile
  const startedContainerTest = startedContainers.get(tableName);
  if (startedContainerTest && startedContainerTest !== 'stopped') {
    await startedContainer.stop();
    return createClient(startedContainerTest);
  }

  startedContainers.set(tableName, startedContainer);
  return createClient(startedContainer);
};

export const endpointUrl = (startedContainer: StartedTestContainer): string => {
  return `http://${startedContainer.getHost()}:${startedContainer.getMappedPort(
    MAPPED_PORT
  )}`;
};

export const createClient = (
  startedContainer: StartedTestContainer
): DynamoDB => {
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

export const startContainer = (): Promise<StartedTestContainer> => {
  const startedContainer = new GenericContainer(IMAGE_NAME)
    .withExposedPorts(MAPPED_PORT)
    .start();
  return startedContainer;
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
