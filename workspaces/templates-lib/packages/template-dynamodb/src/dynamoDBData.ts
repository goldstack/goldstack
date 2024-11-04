import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import {
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  ResourceInUseException,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { getTableName } from './dynamoDBPackageUtils';
import { DynamoDBDeployment, DynamoDBPackage } from './templateDynamoDB';
import { debug, warn } from '@goldstack/utils-log';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function assertTableActive(
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName: string,
  client: DynamoDBClient
): Promise<void> {
  const tableName = await getTableName(packageConfig, deploymentName);
  let retries = 0;
  let tableStatus: string | undefined = undefined;
  // ensure that able is ACTIVE before proceeding
  while (tableStatus !== 'ACTIVE' && retries < 120) {
    try {
      const tableInfo = await client.send(
        new DescribeTableCommand({
          TableName: tableName,
        })
      );
      tableStatus = tableInfo.Table?.TableStatus;
    } catch (e) {
      warn(`Error retrieving table information: ${e.code}.\n${e}`);
    }
    debug(
      `DynamoDB table '${tableName}' created. Current table status: ${tableStatus}. Retries: ${retries}`
    );
    await sleep(1000);
    retries++;
  }
  if (retries === 120) {
    throw new Error(
      `DynamoDB table '${tableName}' creation timed out. Status: ${tableStatus}`
    );
  }
}

export const assertTable = async (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName: string,
  client: DynamoDBClient
): Promise<void> => {
  const tableName = await getTableName(packageConfig, deploymentName);
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
    })
  );

  await new Promise<void>((resolve, reject) => {
    res
      .then(async () => {
        debug(`DynamoDB table '${tableName}' created.`);
        resolve();
      })
      .catch((e) => {
        if (e instanceof ResourceInUseException) {
          // all good if table exists already
          resolve();
          return;
        }
        reject(e);
      });
  });
};

export const deleteTable = async (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName: string,
  client: DynamoDBClient
): Promise<void> => {
  const tableName = await getTableName(packageConfig, deploymentName);
  const res = client.send(
    new DeleteTableCommand({
      TableName: tableName,
    })
  );
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
