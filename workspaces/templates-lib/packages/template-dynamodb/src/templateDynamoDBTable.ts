import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import type { DynamoDBPackage, DynamoDBDeployment } from './types/DynamoDBPackage';
import { getDeploymentName, getTableName as getTableNameUtils } from './dynamoDBPackageUtils';

import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import { assertTable, assertTableActive, deleteTable as deleteTableModule } from './dynamoDBData';
import type { InputMigrations } from 'umzug/lib/types';
import {
  type DynamoDBContext,
  performMigrations,
  migrateDownTo as migrateDownToDynamoDB,
} from './dynamoDBMigrations';

import { excludeInBundle } from '@goldstack/utils-esbuild';
import { fromEnv } from '@aws-sdk/credential-providers';
import type { AwsCredentialIdentityProvider } from '@aws-sdk/types';

// Importing type signatures from localDynamoDB
import type {
  LocalConnectType,
  StartLocalDynamoDBType,
  StopLocalDynamoDBType,
  StopAllLocalDynamoDBType,
} from './local/localDynamoDB';
import { debug } from '@goldstack/utils-log';

/**
 * Map to keep track for which deployment and tables initialisation and migrations have already been performed
 */
const coldStart: Map<string, boolean> = new Map();

export const getTableName = async (
  goldstackConfig: DynamoDBPackage | any,
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

export const startLocalDynamoDB = async (
  goldstackConfig: DynamoDBPackage | any,
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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const lib = require(excludeInBundle('./local/localDynamoDB')) as {
    startLocalDynamoDB: StartLocalDynamoDBType;
  };
  const portToUse =
    port || (process.env.DYNAMODB_LOCAL_PORT && parseInt(process.env.DYNAMODB_LOCAL_PORT)) || 8000;
  await lib.startLocalDynamoDB(packageConfig, { port: portToUse }, deploymentName);
};

export const stopAllLocalDynamoDB = async (
  goldstackConfig: DynamoDBPackage | any,
  packageSchema: any,
  deploymentName?: string,
): Promise<void> => {
  deploymentName = getDeploymentName(deploymentName);
  const packageConfig = new EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });

  // Suppress ESLint error for dynamic require
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const lib = require(excludeInBundle('./local/localDynamoDB')) as {
    stopAllLocalDynamoDB: StopAllLocalDynamoDBType;
  };
  await lib.stopAllLocalDynamoDB(packageConfig, deploymentName);

  const coldStartKey = await getColdStartKey(packageConfig, deploymentName);
  coldStart.delete(coldStartKey);
};

export const stopLocalDynamoDB = async (
  goldstackConfig: DynamoDBPackage | any,
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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const lib = require(excludeInBundle('./local/localDynamoDB')) as {
    stopLocalDynamoDB: StopLocalDynamoDBType;
  };
  await lib.stopLocalDynamoDB(packageConfig, port ? { port } : {}, resolvedDeploymentName);

  const coldStartKey = await getColdStartKey(packageConfig, resolvedDeploymentName);
  coldStart.delete(coldStartKey);
};

const createClient = async (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName: string,
): Promise<DynamoDBClient> => {
  if (deploymentName === 'local') {
    debug('Connecting to local DynamoDB instance');
    // Suppress ESLint error for dynamic require
    // eslint-disable-next-line @typescript-eslint/no-var-requires
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
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const infraAWSLib = require(excludeInBundle('@goldstack/infra-aws'));
    awsUser = await infraAWSLib.getAWSUser(deployment.awsUser);
  }
  const dynamoDB = new DynamoDBClient({
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
  goldstackConfig,
  packageSchema,
  deploymentName,
}: {
  goldstackConfig: DynamoDBPackage | any;
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
