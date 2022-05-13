import { PackageConfig } from '@goldstack/utils-package-config';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { getTableName } from './dynamoDBPackageUtils';
import DynamoDBPackage, { DynamoDBDeployment } from './types/DynamoDBPackage';
import { DynamoDBStorage } from './umzugDynamoDBStorage';

import { InputMigrations } from 'umzug/lib/types';
import { Umzug } from 'umzug';

export interface DynamoDBContext {
  client: DynamoDB;
  tableName: string;
}

export const performMigrations = async (
  packageConfig: PackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName: string,
  migrations: InputMigrations<DynamoDBContext>,
  client: DynamoDB
): Promise<void> => {
  const umzug = await initUmzug(
    packageConfig,
    deploymentName,
    client,
    migrations
  );

  await umzug.up();
};

export const migrateDownTo = async (
  migrationName: string,
  packageConfig: PackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName: string,
  migrations: InputMigrations<DynamoDBContext>,
  client: DynamoDB
): Promise<void> => {
  const umzug = await initUmzug(
    packageConfig,
    deploymentName,
    client,
    migrations
  );

  await umzug.down({ to: migrationName });
};

async function initUmzug(
  packageConfig: PackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName: string,
  client: DynamoDB,
  migrations: InputMigrations<DynamoDBContext>
) {
  const tableName = await getTableName(packageConfig, deploymentName);
  const storage = new DynamoDBStorage({
    dynamoDB: client,
    tableName,
  });

  const umzug = new Umzug<DynamoDBContext>({
    migrations: migrations,
    context: {
      client,
      tableName,
    },
    logger: console,
    storage: storage,
  });
  return umzug;
}
