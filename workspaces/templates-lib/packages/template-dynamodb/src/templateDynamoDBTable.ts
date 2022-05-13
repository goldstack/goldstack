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
import { assertTable } from './dynamoDBData';
import { InputMigrations } from 'umzug/lib/types';
import {
  DynamoDBContext,
  performMigrations,
  migrateDownTo as migrateDownToDynamoDB,
} from './dynamoDBMigrations';

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

  return getTableNameUtils(packageConfig, deploymentName);
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

  return stopLocalDynamoDBUtils(packageConfig, deploymentName);
};

const createClient = async (
  packageConfig: PackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName: string
): Promise<DynamoDB> => {
  if (deploymentName === 'local') {
    return localConnect(packageConfig, deploymentName);
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

export const connect = async ({
  goldstackConfig,
  packageSchema,
  migrations,
  deploymentName,
}: {
  goldstackConfig: DynamoDBPackage | any;
  packageSchema: any;
  migrations: InputMigrations<DynamoDBContext>;
  deploymentName?: string;
}): Promise<DynamoDB> => {
  deploymentName = getDeploymentName(deploymentName);
  const packageConfig = new PackageConfig<DynamoDBPackage, DynamoDBDeployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });
  const client = await createClient(packageConfig, deploymentName);

  await assertTable(packageConfig, deploymentName, client);

  await performMigrations(packageConfig, deploymentName, migrations, client);

  return client;
};

export const migrateDownTo = async ({
  migrationName,
  goldstackConfig,
  packageSchema,
  migrations,
  deploymentName,
}: {
  migrationName: string;
  goldstackConfig: DynamoDBPackage | any;
  packageSchema: any;
  migrations: InputMigrations<DynamoDBContext>;
  deploymentName?: string;
}): Promise<DynamoDB> => {
  deploymentName = getDeploymentName(deploymentName);
  const packageConfig = new PackageConfig<DynamoDBPackage, DynamoDBDeployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });
  const client = await createClient(packageConfig, deploymentName);

  await assertTable(packageConfig, deploymentName, client);

  await migrateDownToDynamoDB(
    migrationName,
    packageConfig,
    deploymentName,
    migrations,
    client
  );

  return client;
};
