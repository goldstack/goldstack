import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import {
  connect as templateConnect,
  getTableName as templateGetTableName,
  migrateDownTo as templateMigrateDownTo,
  startLocalDynamoDB as templateStartLocalDynamoDB,
  stopAllLocalDynamoDB as templateStopAllLocalDynamoDB,
  stopLocalDynamoDB as templateStopLocalDynamoDB,
} from '@goldstack/template-dynamodb';
import goldstackConfig from './../goldstack.json';
import goldstackSchema from './../schemas/package.schema.json';
import type { Table } from './entities';
import { createTable } from './entities';
import { createMigrations } from './migrations';

export { DynamoDBClient };

export { Entity } from 'dynamodb-toolbox';

export * from './entities';

/**
 * Connects to the DynamoDB table for the specified deployment.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns {Promise<DynamoDBClient>} A promise that resolves with a DynamoDBClient instance.
 */
export const connect = async (deploymentName?: string): Promise<DynamoDBClient> => {
  return await templateConnect({
    goldstackConfig,
    packageSchema: goldstackSchema,
    deploymentName,
    migrations: createMigrations(),
  });
};

/**
 * Parameters for connecting to a DynamoDB table.
 */
export interface ConnectTableParams {
  /** Optional name of the deployment to use. */
  deploymentName?: string;
  /** Optional DynamoDBDocumentClient to use. */
  documentClient?: DynamoDBDocumentClient;
  /** Optional DynamoDBClient to use. */
  client?: DynamoDBClient;
}

/**
 * Connects to the DynamoDB table and returns a Table instance for data operations.
 *
 * @param params - Optional parameters for connecting to the table.
 * @returns {Promise<Table>} A promise that resolves with a Table instance.
 */
export const connectTable = async (params?: ConnectTableParams): Promise<Table> => {
  const tableName = await getTableName(params?.deploymentName);

  if (params?.documentClient) {
    return createTable(params.documentClient, tableName);
  }

  if (params?.client) {
    return createTable(DynamoDBDocumentClient.from(params.client), tableName);
  }

  return createTable(DynamoDBDocument.from(await connect(params?.deploymentName)), tableName);
};

/**
 * Migrates the DynamoDB table down to a specific migration.
 *
 * @param migrationName - The name of the migration to roll back to.
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns {Promise<DynamoDBClient>} A promise that resolves with a DynamoDBClient instance.
 */
export const migrateDownTo = async (
  migrationName: string,
  deploymentName?: string,
): Promise<DynamoDBClient> => {
  return await templateMigrateDownTo({
    migrationName,
    goldstackConfig,
    packageSchema: goldstackSchema,
    deploymentName,
    migrations: createMigrations(),
  });
};

/**
 * Parameters for starting a local DynamoDB instance.
 */
export interface StartLocalDynamoDBParams {
  /** Optional port number to start the local DynamoDB on. Defaults to 8000. */
  port?: number;
  /** Whether to run the DynamoDB instance in detached mode. */
  detached?: boolean;
  /** Optional name of the deployment to use. */
  deploymentName?: string;
}

/**
 * Starts a local DynamoDB instance for development and testing.
 *
 * @param portOrOptions - Optional port number or options object containing port, detached, and deploymentName.
 * @param deploymentName - Optional deployment name (only used if portOrOptions is a number).
 * @returns {Promise<void>} A promise that resolves when the local DynamoDB has started.
 *
 * @example
 * // Using new object parameter style
 * await startLocalDynamoDB({ port: 8000, detached: false });
 *
 * @example
 * // Using legacy positional parameter style
 * await startLocalDynamoDB(8000, 'local');
 */
export const startLocalDynamoDB = async (
  portOrOptions?: number | StartLocalDynamoDBParams,
  deploymentName?: string,
): Promise<void> => {
  return await templateStartLocalDynamoDB(
    goldstackConfig,
    goldstackSchema,
    portOrOptions,
    deploymentName,
  );
};

/**
 * Stops a local DynamoDB instance.
 *
 * @param port - Optional port number of the local DynamoDB to stop.
 * @param deploymentName - Optional name of the deployment to use.
 * @returns {Promise<void>} A promise that resolves when the local DynamoDB has stopped.
 */
export const stopLocalDynamoDB = async (port?: string, deploymentName?: string): Promise<void> => {
  return await templateStopLocalDynamoDB(goldstackConfig, goldstackSchema, port, deploymentName);
};

/**
 * Stops all local DynamoDB instances.
 *
 * @param deploymentName - Optional name of the deployment to use.
 * @returns {Promise<void>} A promise that resolves when all local DynamoDB instances have stopped.
 */
export const stopAllLocalDynamoDB = async (deploymentName?: string): Promise<void> => {
  return await templateStopAllLocalDynamoDB(goldstackConfig, goldstackSchema, deploymentName);
};

/**
 * Gets the name of the DynamoDB table for the specified deployment.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns {Promise<string>} A promise that resolves with the table name string.
 */
export const getTableName = async (deploymentName?: string): Promise<string> => {
  return await templateGetTableName(goldstackConfig, goldstackSchema, deploymentName);
};
