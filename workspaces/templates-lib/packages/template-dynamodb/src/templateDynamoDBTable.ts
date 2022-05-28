/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { getAWSUser } from '@goldstack/infra-aws';
import DynamoDB from 'aws-sdk/clients/dynamodb';

import { DynamoDBPackage, DynamoDBDeployment } from './types/DynamoDBPackage';
import {
  getDeploymentName,
  getTableName as getTableNameUtils,
} from './dynamoDBPackageUtils';

import { PackageConfig } from '@goldstack/utils-package-config';
import { assertTable, deleteTable as deleteTableModule } from './dynamoDBData';
import { InputMigrations } from 'umzug/lib/types';
import {
  DynamoDBContext,
  performMigrations,
  migrateDownTo as migrateDownToDynamoDB,
} from './dynamoDBMigrations';

/**
 * Map to keep track for which deployment and tables initialisation and migrations have already been performed
 */
const coldStart: Map<string, boolean> = new Map();

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

  // only load this file when we absolutely need it, so we can avoid packaging it
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const lib = require('./localDynamoDB');
  await lib.stopLocalDynamoDB(packageConfig, deploymentName);

  const coldStartKey = getColdStartKey(packageConfig, deploymentName);
  coldStart.delete(coldStartKey);
};

const createClient = async (
  packageConfig: PackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName: string
): Promise<DynamoDB> => {
  if (deploymentName === 'local') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const lib = require('./localDynamoDB');
    return lib.localConnect(packageConfig, deploymentName);
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

  // ensure table initialisation and migrations are only performed once per cold start

  const coldStartKey = getColdStartKey(packageConfig, deploymentName);
  if (!coldStart.has(coldStartKey)) {
    await assertTable(packageConfig, deploymentName, client);

    await performMigrations(packageConfig, deploymentName, migrations, client);
    coldStart.set(coldStartKey, true);
  }
  return client;
};

/**
 * Deletes the DynamoDB table with all its data.
 */
export const deleteTable = async ({
  goldstackConfig,
  packageSchema,
  deploymentName,
}: {
  goldstackConfig: DynamoDBPackage | any;
  packageSchema: any;
  deploymentName?: string;
}): Promise<DynamoDB> => {
  deploymentName = getDeploymentName(deploymentName);
  const packageConfig = new PackageConfig<DynamoDBPackage, DynamoDBDeployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });
  const client = await createClient(packageConfig, deploymentName);

  await deleteTableModule(packageConfig, deploymentName, client);

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

function getColdStartKey(
  packageConfig: PackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName: string
) {
  if (deploymentName === 'local') {
    return `local-${getTableNameUtils(packageConfig, deploymentName)}`;
  }
  const deployment = packageConfig.getDeployment(deploymentName);
  const coldStartKey = `${deployment.awsRegion}-${deploymentName}-${deployment.tableName}`;
  return coldStartKey;
}
