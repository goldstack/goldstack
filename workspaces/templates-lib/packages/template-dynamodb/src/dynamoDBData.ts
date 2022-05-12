import { PackageConfig } from '@goldstack/utils-package-config';
import { AWSError } from 'aws-sdk';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { getTableName } from './dynamoDBPackageUtils';
import { DynamoDBDeployment, DynamoDBPackage } from './templateDynamoDB';

export const assertTable = async (
  packageConfig: PackageConfig<DynamoDBPackage, DynamoDBDeployment>,
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
        let retries = 0;
        let tableStatus: string | undefined = undefined;
        // ensure that able is ACTIVE before proceeding
        while (tableStatus !== 'ACTIVE' && retries < 20) {
          const tableInfo = await client
            .describeTable({ TableName: tableName })
            .promise();
          tableStatus = tableInfo.Table?.TableStatus;
          retries++;
        }
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
