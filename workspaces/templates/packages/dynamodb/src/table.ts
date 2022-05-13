import {
  connect as templateConnect,
  getTableName as templateGetTableName,
  stopLocalDynamoDB as templateStopLocalDynamoDB,
  migrateDownTo as templateMigrateDownTo,
} from '@goldstack/template-dynamodb';

import DynamoDB from 'aws-sdk/clients/dynamodb';
import goldstackConfig from './../goldstack.json';
import goldstackSchema from './../schemas/package.schema.json';
import { createMigrations } from './migrations';

export const connect = async (deploymentName?: string): Promise<DynamoDB> => {
  return await templateConnect({
    goldstackConfig,
    packageSchema: goldstackSchema,
    deploymentName,
    migrations: createMigrations(),
  });
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
