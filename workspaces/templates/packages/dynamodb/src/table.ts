import {
  connect as templateConnect,
  getTableName as templateGetTableName,
  stopLocalDynamoDB as templateStopLocalDynamoDB,
  migrateDownTo as templateMigrateDownTo,
} from '@goldstack/template-dynamodb';

import DynamoDB from 'aws-sdk/clients/dynamodb';
import { Table } from 'dynamodb-toolbox';
import goldstackConfig from './../goldstack.json';
import goldstackSchema from './../schemas/package.schema.json';
import { createTable } from './entities';
import { createMigrations } from './migrations';

export * from './entities';

export const connect = async (deploymentName?: string): Promise<DynamoDB> => {
  return await templateConnect({
    goldstackConfig,
    packageSchema: goldstackSchema,
    deploymentName,
    migrations: createMigrations(),
  });
};

export interface ConnectTableParams {
  deploymentName?: string;
  documentClient?: DynamoDB.DocumentClient;
  client?: DynamoDB;
}

export const connectTable = async <Name extends string>(
  params?: ConnectTableParams
): Promise<Table<Name, 'pk', 'sk'>> => {
  const tableName = await getTableName(params?.deploymentName);
  return createTable(
    params?.documentClient || params?.client
      ? new DynamoDB.DocumentClient({ service: params.client })
      : undefined ||
          new DynamoDB.DocumentClient({
            service: await connect(params?.deploymentName),
          }),
    tableName
  );
};

export const migrateDownTo = async (
  migrationName: string,
  deploymentName?: string
): Promise<DynamoDB> => {
  return await templateMigrateDownTo({
    migrationName,
    goldstackConfig,
    packageSchema: goldstackSchema,
    deploymentName,
    migrations: createMigrations(),
  });
};

export const stopLocalDynamoDB = async (
  deploymentName?: string
): Promise<void> => {
  return await templateStopLocalDynamoDB(
    goldstackConfig,
    goldstackSchema,
    deploymentName
  );
};
export const getTableName = async (
  deploymentName?: string
): Promise<string> => {
  return await templateGetTableName(
    goldstackConfig,
    goldstackSchema,
    deploymentName
  );
};
