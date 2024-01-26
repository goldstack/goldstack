import { AwsCredentialIdentity } from '@aws-sdk/types';

import {
  BucketAlreadyOwnedByYou,
  CreateBucketCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import {
  CreateTableCommand,
  DynamoDBClient,
  ResourceInUseException,
} from '@aws-sdk/client-dynamodb';

const assertDynamoDBTable = async (params: {
  dynamoDB: DynamoDBClient;
  tableName: string;
}) => {
  // defining a table as required by Terraform https://www.terraform.io/docs/language/settings/backends/s3.html#dynamodb_table
  try {
    await params.dynamoDB.send(
      new CreateTableCommand({
        AttributeDefinitions: [
          {
            AttributeName: 'LockID',
            AttributeType: 'S',
          },
        ],
        KeySchema: [
          {
            AttributeName: 'LockID',
            KeyType: 'HASH',
          },
        ],
        TableName: params.tableName,
        BillingMode: 'PAY_PER_REQUEST',
      })
    );
  } catch (e) {
    if (!(e instanceof ResourceInUseException)) {
      throw new Error(e.message);
    }
  }
};

const assertS3Bucket = async (params: {
  s3: S3Client;
  bucketName: string;
}): Promise<void> => {
  const bucketParams = {
    Bucket: params.bucketName,
  };
  try {
    console.log(
      'Accessing/creating bucket for Terraform state',
      bucketParams.Bucket
    );

    await params.s3.send(new CreateBucketCommand(bucketParams));
  } catch (e) {
    // if bucket already exists, ignore error
    if (!(e instanceof BucketAlreadyOwnedByYou)) {
      console.error(
        'Cannot create bucket ',
        params.bucketName,
        ' error code',
        e.code
      );
      throw new Error('Cannot create S3 state bucket: ' + e.message);
    }
  }
};

export const createState = async (params: {
  credentials: AwsCredentialIdentity;
  dynamoDBTableName: string;
  bucketName: string;
  awsRegion: string;
}): Promise<void> => {
  const dynamoDB = new DynamoDBClient({
    region: params.awsRegion,
    credentials: params.credentials,
  });
  await assertDynamoDBTable({ dynamoDB, tableName: params.dynamoDBTableName });
  const s3 = new S3Client({
    region: params.awsRegion,
    credentials: params.credentials,
  });
  await assertS3Bucket({ s3, bucketName: params.bucketName });
};
