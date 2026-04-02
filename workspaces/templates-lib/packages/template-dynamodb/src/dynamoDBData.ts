import {
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  type DynamoDBClient,
  ResourceInUseException,
  ResourceNotFoundException,
  UpdateContinuousBackupsCommand,
} from '@aws-sdk/client-dynamodb';
import { debug, info, warn } from '@goldstack/utils-log';
import type { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import { getTableName } from './dynamoDBPackageUtils';
import type { DynamoDBDeployment, DynamoDBPackage } from './templateDynamoDB';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function assertTableActive(
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName: string,
  client: DynamoDBClient,
): Promise<void> {
  const tableName = await getTableName(packageConfig, deploymentName);
  let retries = 0;
  let tableStatus: string | undefined;
  // ensure that able is ACTIVE before proceeding
  while (tableStatus !== 'ACTIVE' && retries < 120) {
    try {
      const tableInfo = await client.send(
        new DescribeTableCommand({
          TableName: tableName,
        }),
      );
      tableStatus = tableInfo.Table?.TableStatus;
    } catch (e) {
      warn(`Error retrieving table information: ${e.code}.\n${e}`);
    }
    debug(
      `DynamoDB table '${tableName}' current table status: ${tableStatus}. Retries: ${retries}`,
    );
    await sleep(1000);
    retries++;
  }
  if (retries === 120) {
    throw new Error(`DynamoDB table '${tableName}' creation timed out. Status: ${tableStatus}`);
  }
}

export const assertTable = async (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName: string,
  client: DynamoDBClient,
): Promise<void> => {
  const tableName = await getTableName(packageConfig, deploymentName);
  let tableCreated = false;
  const res = client.send(
    new CreateTableCommand({
      TableName: tableName,
      AttributeDefinitions: [
        {
          AttributeName: 'pk',
          AttributeType: 'S',
        },
        {
          AttributeName: 'sk',
          AttributeType: 'S',
        },
      ],
      KeySchema: [
        {
          AttributeName: 'pk',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'sk',
          KeyType: 'RANGE',
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    }),
  );

  await new Promise<void>((resolve, reject) => {
    res
      .then(async () => {
        tableCreated = true;
        info(`DynamoDB table '${tableName}' created.`);
        resolve();
      })
      .catch((e) => {
        if (e instanceof ResourceInUseException) {
          resolve();
          return;
        }
        reject(e);
      });
  });

  if (tableCreated) {
    await enablePITR(client, tableName);
  }
};

async function enablePITR(client: DynamoDBClient, tableName: string): Promise<void> {
  try {
    await client.send(
      new UpdateContinuousBackupsCommand({
        TableName: tableName,
        PointInTimeRecoverySpecification: {
          PointInTimeRecoveryEnabled: true,
        },
      }),
    );
    info(`Enabled point-in-time recovery for DynamoDB table '${tableName}'.`);
  } catch (e) {
    warn(`Failed to enable point-in-time recovery for table '${tableName}': ${e}`);
  }
}

export const deleteTable = async (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName: string,
  client: DynamoDBClient,
): Promise<void> => {
  const tableName = await getTableName(packageConfig, deploymentName);
  const res = client.send(
    new DeleteTableCommand({
      TableName: tableName,
    }),
  );
  info(`Deleted DynamoDB table: '${tableName}'`);
  await new Promise<void>((resolve, reject) => {
    res
      .then(async () => {
        resolve();
      })
      .catch((e) => {
        if (e instanceof ResourceNotFoundException) {
          // all good if table already deleted
          resolve();
          return;
        }
        reject(e);
      });
  });
};
