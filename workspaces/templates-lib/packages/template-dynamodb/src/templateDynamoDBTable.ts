/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { getAWSUser } from '@goldstack/infra-aws';
import DynamoDB from 'aws-sdk/clients/dynamodb';

import { DynamoDBPackage, DynamoDBDeployment } from './types/DynamoDBPackage';
import {
  getDeploymentName,
  getTableName as getTableNameUtils,
} from './dynamoDBPackageUtils';

import { PackageConfig } from '@goldstack/utils-package-config';
import {
  localConnect,
  stopLocalDynamoDB as stopLocalDynamoDBUtils,
} from './localDynamoDB';

export const getTableName = async (
  goldstackConfig: DynamoDBPackage | any,
  packageSchema: any,
  deploymentName?: string
): Promise<string> => {
  deploymentName = getDeploymentName(deploymentName);
  const packageConfig = new PackageConfig<DynamoDBPackage, DynamoDBDeployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });
  const config = packageConfig.getConfig();

  return getTableNameUtils(config, packageConfig, deploymentName);
};

export const stopLocalDynamoDB = async (
  goldstackConfig: DynamoDBPackage | any,
  packageSchema: any,
  deploymentName?: string
): Promise<void> => {
  deploymentName = getDeploymentName(deploymentName);
  const packageConfig = new PackageConfig<DynamoDBPackage, DynamoDBDeployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });
  const config = packageConfig.getConfig();

  return stopLocalDynamoDBUtils(config, packageConfig, deploymentName);
};

export const connect = async (
  goldstackConfig: DynamoDBPackage | any,
  packageSchema: any,
  deploymentName?: string
): Promise<DynamoDB> => {
  deploymentName = getDeploymentName(deploymentName);
  const packageConfig = new PackageConfig<DynamoDBPackage, DynamoDBDeployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });
  const config = packageConfig.getConfig();
  if (deploymentName === 'local') {
    return localConnect(config, packageSchema, deploymentName);
  }
  const deployment = packageConfig.getDeployment(deploymentName);

  const awsUser = await getAWSUser(deployment.awsUser);

  const dynamoDB = new DynamoDB({
    apiVersion: '2012-08-10',
    credentials: awsUser,
    region: deployment.awsRegion,
  });

  return dynamoDB;
};
