/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { getAWSUser } from '@goldstack/infra-aws';
import DynamoDB from 'aws-sdk/clients/dynamodb';

import { DynamoDBPackage, DynamoDBDeployment } from './types/DynamoDBPackage';
import assert from 'assert';

import { PackageConfig } from '@goldstack/utils-package-config';
import {
  DynamoDBContainer,
  StartedDynamoDBContainer,
} from 'testcontainers-dynamodb';

type DynamoDBTableName = string;

const startedContainers: Map<
  DynamoDBTableName,
  StartedDynamoDBContainer | 'stopped'
> = new Map();

export const stopLocalDynamoDB = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentName?: string
): Promise<void> => {
  const tableName = await getTableName(
    goldstackConfig,
    packageSchema,
    deploymentName
  );
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

const getDeploymentName = (deploymentName?: string): string => {
  if (!deploymentName) {
    assert(
      process.env.GOLDSTACK_DEPLOYMENT,
      'Cannot connect to DynamoDB table. Either specify a deploymentName or ensure environment variable GOLDSTACK_DEPLOYMENT is defined.'
    );
    return process.env.GOLDSTACK_DEPLOYMENT;
  }
  return deploymentName;
};

export const connect = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentName?: string
): Promise<DynamoDB> => {
  deploymentName = getDeploymentName(deploymentName);
  const packageConfig = new PackageConfig<DynamoDBPackage, DynamoDBDeployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });
  if (deploymentName === 'local') {
    const tableName = await getTableName(
      goldstackConfig,
      packageSchema,
      deploymentName
    );

    // TODO the key in this map may need to be extended to include the region as well, since dynamodb table names are unique per region.
    let startedContainer = startedContainers.get(tableName);
    if (startedContainer && startedContainer !== 'stopped') {
      return startedContainer.createDynamoClient();
    }
    startedContainer = await new DynamoDBContainer().start();

    // Check if another container for this table has already been started in the meanwhile
    const startedContainerTest = startedContainers.get(tableName);
    if (startedContainerTest && startedContainerTest !== 'stopped') {
      await startedContainer.stop();
      return startedContainerTest.createDynamoClient();
    }

    startedContainers.set(tableName, startedContainer);
    throw new Error('Local development not implemented yet');
  }
  const config = packageConfig.getConfigFromPackageConfig(goldstackConfig);
  const deployment = packageConfig.getDeployment(config, deploymentName);

  const awsUser = await getAWSUser(deployment.awsUser);

  const dynamoDB = new DynamoDB({
    apiVersion: '2012-08-10',
    credentials: awsUser,
    region: deployment.awsRegion,
  });

  return dynamoDB;
};

export const getTableName = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentName?: string
): Promise<string> => {
  const packageConfig = new PackageConfig<DynamoDBPackage, DynamoDBDeployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });
  deploymentName = getDeploymentName(deploymentName);
  if (deploymentName === 'local') {
    return `local-${goldstackConfig.name}`;
  }
  const config = packageConfig.getConfigFromPackageConfig(goldstackConfig);
  const deployment = packageConfig.getDeployment(config, deploymentName);
  return deployment.configuration.tableName;
};
