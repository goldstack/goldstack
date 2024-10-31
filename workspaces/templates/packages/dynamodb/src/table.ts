import {
  connect as templateConnect,
  getTableName as templateGetTableName,
  startLocalDynamoDB as templateStartLocalDynamoDB,
  stopLocalDynamoDB as templateStopLocalDynamoDB,
  migrateDownTo as templateMigrateDownTo,
} from '@goldstack/template-dynamodb';

import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Table } from './entities';
import goldstackConfig from './../goldstack.json';
import goldstackSchema from './../schemas/package.schema.json';
import { createTable } from './entities';
import { createMigrations } from './migrations';

export { DynamoDBClient };

export { Entity } from 'dynamodb-toolbox';

export * from './entities';

export const connect = async (
  deploymentName?: string
): Promise<DynamoDBClient> => {
  return await templateConnect({
    goldstackConfig,
    packageSchema: goldstackSchema,
    deploymentName,
    migrations: createMigrations(),
  });
};

export interface ConnectTableParams {
  deploymentName?: string;
  documentClient?: DynamoDBDocumentClient;
  client?: DynamoDBClient;
}

export const connectTable = async (
  params?: ConnectTableParams
): Promise<Table> => {
  const tableName = await getTableName(params?.deploymentName);

  if (params?.documentClient) {
    return createTable(params.documentClient, tableName);
  }

  if (params?.client) {
    return createTable(DynamoDBDocumentClient.from(params.client), tableName);
  }

  return createTable(
    DynamoDBDocument.from(await connect(params?.deploymentName)),
    tableName
  );
};

export const migrateDownTo = async (
  migrationName: string,
  deploymentName?: string
): Promise<DynamoDBClient> => {
  return await templateMigrateDownTo({
    migrationName,
    goldstackConfig,
    packageSchema: goldstackSchema,
    deploymentName,
    migrations: createMigrations(),
  });
};

export const startLocalDynamoDB = async (
  port?: number,
  deploymentName?: string
): Promise<void> => {
  port = port || 8000;
  return await templateStartLocalDynamoDB(
    goldstackConfig,
    goldstackSchema,
    port,
    deploymentName
  );
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
