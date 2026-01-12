import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { fromEnv } from '@aws-sdk/credential-providers';
import type { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import { excludeInBundle } from '@goldstack/utils-esbuild';
import { debug } from '@goldstack/utils-log';
import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import type { InputMigrations } from 'umzug/lib/types';
import { assertTable, assertTableActive, deleteTable as deleteTableModule } from './dynamoDBData';
import {
  type DynamoDBContext,
  migrateDownTo as migrateDownToDynamoDB,
  performMigrations,
} from './dynamoDBMigrations';
import { getDeploymentName, getTableName as getTableNameUtils } from './dynamoDBPackageUtils';

// Importing type signatures from localDynamoDB
import type {
  LocalConnectType,
  StartLocalDynamoDBType,
  StopAllLocalDynamoDBType,
  StopLocalDynamoDBType,
} from './local/localDynamoDB';
import type { DynamoDBDeployment, DynamoDBPackage } from './types/DynamoDBPackage';

/**
 * Map to keep track for which deployment and tables initialisation and migrations have already been performed
 */
const coldStart: Map<string, boolean> = new Map();

/**
 * Gets the table name for the given configuration and deployment.
 *
 * @param goldstackConfig - The Goldstack configuration for the DynamoDB package.
 * @param packageSchema - The package schema.
 * @param deploymentName - Optional deployment name.
 * @returns Promise<string> - The table name.
 */
export const getTableName = async (
  // biome-ignore lint/suspicious/noExplicitAny: Accepts flexible input
  goldstackConfig: DynamoDBPackage | any,
  // biome-ignore lint/suspicious/noExplicitAny: Accepts flexible input
  packageSchema: any,
  deploymentName?: string,
): Promise<string> => {
  deploymentName = getDeploymentName(deploymentName);
  const packageConfig = new EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });

  return getTableNameUtils(packageConfig, deploymentName);
};

/**
 * Starts a local DynamoDB instance for development and testing.
 *
 * @param goldstackConfig - The Goldstack configuration for the DynamoDB package.
 * @param packageSchema - The package schema.
 * @param port - Optional port number to start the local DynamoDB on.
 * @param deploymentName - Optional deployment name.
 * @returns Promise<void>
 */
export const startLocalDynamoDB = async (
  // biome-ignore lint/suspicious/noExplicitAny: Accepts flexible input
  goldstackConfig: DynamoDBPackage | any,
  // biome-ignore lint/suspicious/noExplicitAny: Accepts flexible input
  packageSchema: any,
  port?: number,
  deploymentName?: string,
): Promise<void> => {
  deploymentName = getDeploymentName(deploymentName);
  const packageConfig = new EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });

  // Suppress ESLint error for dynamic require

  const lib = require(excludeInBundle('./local/localDynamoDB')) as {
    startLocalDynamoDB: StartLocalDynamoDBType;
  };
  const portToUse =
    port ||
    (process.env.DYNAMODB_LOCAL_PORT && parseInt(process.env.DYNAMODB_LOCAL_PORT, 10)) ||
    8000;
  await lib.startLocalDynamoDB(packageConfig, { port: portToUse }, deploymentName);
};

/**
 * Stops all local DynamoDB instances.
 *
 * @param goldstackConfig - The Goldstack configuration for the DynamoDB package.
 * @param packageSchema - The package schema.
 * @param deploymentName - Optional deployment name.
 * @returns Promise<void>
 */
export const stopAllLocalDynamoDB = async (
  // biome-ignore lint/suspicious/noExplicitAny: Accepts flexible input
  goldstackConfig: DynamoDBPackage | any,
  // biome-ignore lint/suspicious/noExplicitAny: Accepts flexible input
  packageSchema: any,
  deploymentName?: string,
): Promise<void> => {
  deploymentName = getDeploymentName(deploymentName);
  const packageConfig = new EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });

  // Suppress ESLint error for dynamic require

  const lib = require(excludeInBundle('./local/localDynamoDB')) as {
    stopAllLocalDynamoDB: StopAllLocalDynamoDBType;
  };
  await lib.stopAllLocalDynamoDB(packageConfig, deploymentName);

  const coldStartKey = await getColdStartKey(packageConfig, deploymentName);
  coldStart.delete(coldStartKey);
};

/**
 * Stops a local DynamoDB instance.
 *
 * @param goldstackConfig - The Goldstack configuration for the DynamoDB package.
 * @param packageSchema - The package schema.
 * @param portOrDeploymentName - Optional port number or deployment name.
 * @param deploymentName - Optional deployment name.
 * @returns Promise<void>
 */
export const stopLocalDynamoDB = async (
  // biome-ignore lint/suspicious/noExplicitAny: Accepts flexible input
  goldstackConfig: DynamoDBPackage | any,
  // biome-ignore lint/suspicious/noExplicitAny: Accepts flexible input
  packageSchema: any,
  portOrDeploymentName?: number | string,
  deploymentName?: string,
): Promise<void> => {
  // Handle optional port parameter
  let port: number | undefined;
  let resolvedDeploymentName: string | undefined;

  if (typeof portOrDeploymentName === 'number') {
    port = portOrDeploymentName;
    resolvedDeploymentName = deploymentName;
  } else {
    resolvedDeploymentName = portOrDeploymentName;
  }

  resolvedDeploymentName = getDeploymentName(resolvedDeploymentName);
  const packageConfig = new EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });

  // Suppress ESLint error for dynamic require

  const lib = require(excludeInBundle('./local/localDynamoDB')) as {
    stopLocalDynamoDB: StopLocalDynamoDBType;
  };
  await lib.stopLocalDynamoDB(packageConfig, port ? { port } : {}, resolvedDeploymentName);

  const coldStartKey = await getColdStartKey(packageConfig, resolvedDeploymentName);
  coldStart.delete(coldStartKey);
};

let localMessageShown = false;

const createClient = async (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName: string,
): Promise<DynamoDBClient> => {
  if (deploymentName === 'local') {
    if (!localMessageShown) {
      debug('Connecting to local DynamoDB instance');
      localMessageShown = true;
    }

    const lib = require(excludeInBundle('./local/localDynamoDB')) as {
      localConnect: LocalConnectType;
    };
    return lib.localConnect(packageConfig, deploymentName);
  }
  const deployment = packageConfig.getDeployment(deploymentName);

  let awsUser: AwsCredentialIdentityProvider;
  if (process.env.AWS_ACCESS_KEY_ID) {
    awsUser = fromEnv();
  } else {
    // load this in lazy to enable omitting the dependency when bundling lambdas

    const infraAWSLib = require(excludeInBundle('@goldstack/infra-aws'));
    awsUser = await infraAWSLib.getAWSUser(deployment.awsUser);
  }
  const dynamoDB = new DynamoDBClient({
    credentials: awsUser,
    region: deployment.awsRegion,
  });

  return dynamoDB;
};

/**
 * Connects to DynamoDB and performs initial table setup and migrations if necessary.
 *
 * @param params - The connection parameters.
 * @param params.goldstackConfig - The Goldstack configuration for the DynamoDB package.
 * @param params.packageSchema - The package schema.
 * @param params.migrations - The migrations to perform.
 * @param params.deploymentName - Optional deployment name.
 * @returns Promise<DynamoDBClient> - The connected DynamoDB client.
 */
export const connect = async ({
  // biome-ignore lint/suspicious/noExplicitAny: Accepts flexible input
  goldstackConfig,
  // biome-ignore lint/suspicious/noExplicitAny: Accepts flexible input
  packageSchema,
  migrations,
  deploymentName,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: Accepts flexible input
  goldstackConfig: DynamoDBPackage | any;
  // biome-ignore lint/suspicious/noExplicitAny: Accepts flexible input
  packageSchema: any;
  migrations: InputMigrations<DynamoDBContext>;
  deploymentName?: string;
}): Promise<DynamoDBClient> => {
  deploymentName = getDeploymentName(deploymentName);
  const packageConfig = new EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });
  const client = await createClient(packageConfig, deploymentName);

  // ensure table initialisation and migrations are only performed once per cold start
  const coldStartKey = await getColdStartKey(packageConfig, deploymentName);

  if (!coldStart.has(coldStartKey)) {
    await assertTable(packageConfig, deploymentName, client);
    await assertTableActive(packageConfig, deploymentName, client);

    await performMigrations(packageConfig, deploymentName, migrations, client);
    coldStart.set(coldStartKey, true);
  }
  return client;
};

/**
 * Deletes the DynamoDB table with all its data.
 */
export const deleteTable = async ({
  // biome-ignore lint/suspicious/noExplicitAny: Accepts flexible input
  goldstackConfig,
  // biome-ignore lint/suspicious/noExplicitAny: Accepts flexible input
  packageSchema,
  deploymentName,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: Accepts flexible input
  goldstackConfig: DynamoDBPackage | any;
  // biome-ignore lint/suspicious/noExplicitAny: Accepts flexible input
  packageSchema: any;
  deploymentName?: string;
}): Promise<DynamoDBClient> => {
  deploymentName = getDeploymentName(deploymentName);
  const packageConfig = new EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });
  const client = await createClient(packageConfig, deploymentName);

  await deleteTableModule(packageConfig, deploymentName, client);

  return client;
};

/**
 * Migrates the DynamoDB table down to a specific migration.
 *
 * @param params - The migration parameters.
 * @param params.migrationName - The name of the migration to roll back to.
 * @param params.goldstackConfig - The Goldstack configuration for the DynamoDB package.
 * @param params.packageSchema - The package schema.
 * @param params.migrations - The migrations.
 * @param params.deploymentName - Optional deployment name.
 * @returns Promise<DynamoDBClient> - The DynamoDB client.
 */
export const migrateDownTo = async ({
  migrationName,
  // biome-ignore lint/suspicious/noExplicitAny: Accepts flexible input
  goldstackConfig,
  // biome-ignore lint/suspicious/noExplicitAny: Accepts flexible input
  packageSchema,
  migrations,
  deploymentName,
}: {
  migrationName: string;
  // biome-ignore lint/suspicious/noExplicitAny: Accepts flexible input
  goldstackConfig: DynamoDBPackage | any;
  // biome-ignore lint/suspicious/noExplicitAny: Accepts flexible input
  packageSchema: any;
  migrations: InputMigrations<DynamoDBContext>;
  deploymentName?: string;
}): Promise<DynamoDBClient> => {
  deploymentName = getDeploymentName(deploymentName);
  const packageConfig = new EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });
  const client = await createClient(packageConfig, deploymentName);

  await assertTable(packageConfig, deploymentName, client);
  await assertTableActive(packageConfig, deploymentName, client);

  await migrateDownToDynamoDB(migrationName, packageConfig, deploymentName, migrations, client);

  return client;
};

async function getColdStartKey(
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName: string,
) {
  if (deploymentName === 'local') {
    return `local-${await getTableNameUtils(packageConfig, deploymentName)}`;
  }
  const deployment = packageConfig.getDeployment(deploymentName);
  const coldStartKey = `${deployment.awsRegion}-${deploymentName}-${deployment.tableName}`;
  return coldStartKey;
}
