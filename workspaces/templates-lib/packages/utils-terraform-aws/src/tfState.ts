import { AwsCredentialIdentity } from '@aws-sdk/types';

import {
  BucketAlreadyOwnedByYou,
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';

import {
  CreateTableCommand,
  DeleteTableCommand,
  DynamoDBClient,
  ResourceInUseException,
} from '@aws-sdk/client-dynamodb';

import { logger } from '@goldstack/utils-cli';

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
    logger().info('DynamoDB table created for terraform state', {
      tableName: params.tableName,
    });
  } catch (e) {
    if (!(e instanceof ResourceInUseException)) {
      throw new Error(e.message);
    }
  }
};

const deleteDynamoDBTable = async (params: {
  dynamoDB: DynamoDBClient;
  tableName: string;
}): Promise<void> => {
  try {
    await params.dynamoDB.send(
      new DeleteTableCommand({
        TableName: params.tableName,
      })
    );
  } catch (e) {
    throw e;
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
    await params.s3.send(new CreateBucketCommand(bucketParams));
    logger().info('S3 bucket created for storing terraform state', {
      bucketName: bucketParams.Bucket,
    });
  } catch (e) {
    // if bucket already exists, ignore error
    if (!(e instanceof BucketAlreadyOwnedByYou)) {
      logger().error(
        'Cannot create bucket ',
        params.bucketName,
        ' error code',
        e.code
      );
      throw new Error('Cannot create S3 state bucket: ' + e.message);
    }
  }
};

const deleteAllObjectsFromBucket = async (
  s3: S3Client,
  bucketName: string
): Promise<void> => {
  let continuationToken: string | undefined = undefined;
  do {
    // List objects in the bucket
    const listResponse = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
      })
    );

    // Check if there are any objects to delete
    if (listResponse.Contents && listResponse.Contents.length > 0) {
      // Delete listed objects
      const deleteParams = {
        Bucket: bucketName,
        Delete: {
          Objects: listResponse.Contents.map((object) => ({ Key: object.Key })),
        },
      };
      await s3.send(new DeleteObjectsCommand(deleteParams));
    }

    // Check if more objects are to be listed (pagination)
    continuationToken = listResponse.NextContinuationToken;
  } while (continuationToken);
};

const deleteS3Bucket = async (params: {
  s3: S3Client;
  bucketName: string;
}): Promise<void> => {
  try {
    // First, delete all objects from the bucket
    await deleteAllObjectsFromBucket(params.s3, params.bucketName);

    // Then, delete the empty bucket
    await params.s3.send(
      new DeleteBucketCommand({ Bucket: params.bucketName })
    );
  } catch (e) {
    throw e; // Rethrow the error to handle it in the calling code if necessary
  }
};

export const deleteState = async (params: {
  credentials: AwsCredentialIdentity;
  dynamoDBTableName: string;
  bucketName: string;
  awsRegion: string;
}): Promise<void> => {
  const dynamoDB = new DynamoDBClient({
    region: params.awsRegion,
    credentials: params.credentials,
  });
  await deleteDynamoDBTable({
    dynamoDB,
    tableName: params.dynamoDBTableName,
  });
  const s3 = new S3Client({
    region: params.awsRegion,
    credentials: params.credentials,
  });
  await deleteS3Bucket({
    s3,
    bucketName: params.bucketName,
  });
};

export const assertState = async (params: {
  credentials: AwsCredentialIdentity;
  dynamoDBTableName: string;
  bucketName: string;
  awsRegion: string;
}): Promise<void> => {
  logger().info('Connecting to Terraform State stored on AWS', {
    bucketName: params.bucketName,
    tableName: params.dynamoDBTableName,
  });
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
  logger().info('Connected to Terraform State stored on AWS');
};
