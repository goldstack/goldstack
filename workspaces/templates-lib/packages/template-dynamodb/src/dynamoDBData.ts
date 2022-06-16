import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import { AWSError } from 'aws-sdk';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { getTableName } from './dynamoDBPackageUtils';
import { DynamoDBDeployment, DynamoDBPackage } from './templateDynamoDB';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function assertTableActive(
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName: string,
  client: DynamoDB
): Promise<void> {
  const tableName = await getTableName(packageConfig, deploymentName);
  let retries = 0;
  let tableStatus: string | undefined = undefined;
  // ensure that able is ACTIVE before proceeding
  while (tableStatus !== 'ACTIVE' && retries < 120) {
    try {
      const tableInfo = await client
        .describeTable({ TableName: tableName })
        .promise();
      tableStatus = tableInfo.Table?.TableStatus;
    } catch (e) {
      console.warn(`Error retrieving table information: ${e.code}.\n${e}`);
    }
    console.debug(
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
  client: DynamoDB
): Promise<void> => {
  const tableName = await getTableName(packageConfig, deploymentName);
  const res = client
    .createTable({
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
    .promise();

  await new Promise<void>((resolve, reject) => {
    res
      .then(async () => {
        console.debug(`DynamoDB table '${tableName}' created.`);
        resolve();
      })
      .catch((e: AWSError) => {
        if (e.code === 'ResourceInUseException') {
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
  client: DynamoDB
): Promise<void> => {
  const tableName = await getTableName(packageConfig, deploymentName);
  const res = client
    .deleteTable({
      TableName: tableName,
    })
    .promise();
  await new Promise<void>((resolve, reject) => {
    res
      .then(async () => {
        resolve();
      })
      .catch((e: AWSError) => {
        if (e.code === 'ResourceNotFoundException') {
          // all good if table already deleted
          resolve();
          return;
        }
        reject(e);
      });
  });
};
