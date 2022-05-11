/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { getAWSUser } from '@goldstack/infra-aws';
import DynamoDB from 'aws-sdk/clients/dynamodb';

import { DynamoDBPackage, DynamoDBDeployment } from './types/DynamoDBPackage';
import assert from 'assert';

import { PackageConfig } from '@goldstack/utils-package-config';

export const connect = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentName?: string
): Promise<DynamoDB> => {
  const packageConfig = new PackageConfig<DynamoDBPackage, DynamoDBDeployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });
  if (!deploymentName) {
    assert(
      process.env.GOLDSTACK_DEPLOYMENT,
      `Cannot connect to S3 bucket for package ${goldstackConfig.name}. Either specify a deploymentName or ensure environment variable GOLDSTACK_DEPLOYMENT is defined.`
    );
    deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
  }
  if (deploymentName === 'local') {
    throw new Error('Local development not implemeneted yet');
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
  if (!deploymentName) {
    assert(
      process.env.GOLDSTACK_DEPLOYMENT,
      `Cannot get DynamoDB table name for package ${goldstackConfig.name}. Either specify a deploymentName or ensure environment variable GOLDSTACK_DEPLOYMENT is defined.`
    );
    deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
  }
  if (deploymentName === 'local') {
    return `local-${goldstackConfig.name}`;
  }
  const config = packageConfig.getConfigFromPackageConfig(goldstackConfig);
  const deployment = packageConfig.getDeployment(config, deploymentName);
  return deployment.configuration.tableName;
};
