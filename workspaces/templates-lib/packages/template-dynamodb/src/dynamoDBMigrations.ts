import type { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { getTableName } from './dynamoDBPackageUtils';
import type DynamoDBPackage from './types/DynamoDBPackage';
import type { DynamoDBDeployment } from './types/DynamoDBPackage';
import { DynamoDBStorage } from './umzugDynamoDBStorage';
import { debug, error, info } from '@goldstack/utils-log';

import type { InputMigrations } from 'umzug/lib/types';
import { Umzug } from 'umzug';

export interface DynamoDBContext {
  client: DynamoDBClient;
  tableName: string;
}

export const performMigrations = async (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName: string,
  migrations: InputMigrations<DynamoDBContext>,
  client: DynamoDBClient,
): Promise<void> => {
  const umzug = await initUmzug(packageConfig, deploymentName, client, migrations);

  await umzug.up();
};

export const migrateDownTo = async (
  migrationName: string,
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName: string,
  migrations: InputMigrations<DynamoDBContext>,
  client: DynamoDBClient,
): Promise<void> => {
  const umzug = await initUmzug(packageConfig, deploymentName, client, migrations);

  await umzug.down({ to: migrationName });
};

async function initUmzug(
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName: string,
  client: DynamoDBClient,
  migrations: InputMigrations<DynamoDBContext>,
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
    logger: {
      debug: (message: Record<string, unknown>) =>
        debug(`Migrating ${tableName} ${message.name ? message.name : ''}`, message),
      warn: (message: Record<string, unknown>) =>
        debug(`Migrating ${tableName} ${message.name ? message.name : ''}`, message),
      info: (message: Record<string, unknown>) =>
        info(`Migrating ${tableName} ${message.name ? message.name : ''}`, message),
      error: (message: Record<string, unknown>) =>
        error(`Migrating ${tableName} ${message.name ? message.name : ''}`, message),
    },
    storage: storage,
  });
  return umzug;
}
