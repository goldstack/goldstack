import {
  CreateTableCommand,
  DeleteItemCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  ResourceInUseException,
  UpdateContinuousBackupsCommand,
} from '@aws-sdk/client-dynamodb';

import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  ListObjectVersionsCommand,
  PutBucketVersioningCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import type { AwsCredentialIdentity } from '@aws-sdk/types';

import { debug, error, info } from '@goldstack/utils-log';

const assertDynamoDBTable = async (params: { dynamoDB: DynamoDBClient; tableName: string }) => {
  // defining a table as required by Terraform https://www.terraform.io/docs/language/settings/backends/s3.html#dynamodb_table
  let tableCreated = false;
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
      }),
    );
    tableCreated = true;
    info('DynamoDB table created for terraform state', {
      tableName: params.tableName,
    });
  } catch (e) {
    if (!(e instanceof ResourceInUseException)) {
      throw new Error(e.message);
    }
  }

  if (tableCreated) {
    // Wait for table to become ACTIVE
    const startTime = Date.now();
    const timeoutMs = 60 * 1000; // 1 minute
    const pollIntervalMs = 5000; // 5 seconds

    while (Date.now() - startTime < timeoutMs) {
      try {
        const describeResponse = await params.dynamoDB.send(
          new DescribeTableCommand({
            TableName: params.tableName,
          }),
        );
        if (describeResponse.Table?.TableStatus === 'ACTIVE') {
          info('DynamoDB table is now active', {
            tableName: params.tableName,
          });
          await params.dynamoDB.send(
            new UpdateContinuousBackupsCommand({
              TableName: params.tableName,
              PointInTimeRecoverySpecification: {
                PointInTimeRecoveryEnabled: true,
              },
            }),
          );
          info('DynamoDB point-in-time recovery enabled', {
            tableName: params.tableName,
          });
          return;
        }
      } catch (describeError) {
        // If describe fails, continue polling (might be temporary)
      }
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
    throw new Error(`Timeout waiting for DynamoDB table ${params.tableName} to become ACTIVE`);
  }
};

const deleteDynamoDBTable = async (params: {
  dynamoDB: DynamoDBClient;
  tableName: string;
}): Promise<void> => {
  await params.dynamoDB.send(
    new DeleteTableCommand({
      TableName: params.tableName,
    }),
  );
};

const assertS3Bucket = async (params: { s3: S3Client; bucketName: string }): Promise<void> => {
  try {
    await params.s3.send(new HeadBucketCommand({ Bucket: params.bucketName }));
    // Bucket exists
  } catch (err) {
    if (err instanceof S3ServiceException) {
      const status = err.$metadata?.httpStatusCode;
      const code = err.name;
      if (status === 404 || code === 'NotFound') {
        // Bucket does not exist, create it
        try {
          await params.s3.send(new CreateBucketCommand({ Bucket: params.bucketName }));
          info('S3 bucket created for storing terraform state', {
            bucketName: params.bucketName,
          });
          await params.s3.send(
            new PutBucketVersioningCommand({
              Bucket: params.bucketName,
              VersioningConfiguration: {
                Status: 'Enabled',
              },
            }),
          );
          info('S3 bucket versioning enabled', {
            bucketName: params.bucketName,
          });
        } catch (createErr) {
          if (
            createErr instanceof S3ServiceException &&
            (createErr.name === 'BucketAlreadyExists' ||
              createErr.name === 'BucketAlreadyOwnedByYou')
          ) {
            // This is fine, bucket was created by a parallel operation.
            info('S3 bucket for terraform state created by a parallel operation.', {
              bucketName: params.bucketName,
            });
          } else {
            // For any other error, we should rethrow.
            throw createErr;
          }
        }
      } else if (status === 403 || code === 'Forbidden') {
        // Bucket exists but not accessible, assume it exists
      } else {
        throw err;
      }
    } else {
      throw err; // non-AWS error
    }
  }
};

const deleteAllObjectsFromBucket = async (s3: S3Client, bucketName: string): Promise<void> => {
  let nextKeyMarker: string | undefined;
  let nextVersionIdMarker: string | undefined;
  do {
    const listVersionsResponse = await s3.send(
      new ListObjectVersionsCommand({
        Bucket: bucketName,
        KeyMarker: nextKeyMarker,
        VersionIdMarker: nextVersionIdMarker,
      }),
    );

    const objectsToDelete: { Key: string; VersionId?: string }[] = [];

    if (listVersionsResponse.Versions && listVersionsResponse.Versions.length > 0) {
      objectsToDelete.push(
        ...listVersionsResponse.Versions.map((version) => ({
          Key: version.Key!,
          VersionId: version.VersionId,
        })),
      );
    }

    if (listVersionsResponse.DeleteMarkers && listVersionsResponse.DeleteMarkers.length > 0) {
      objectsToDelete.push(
        ...listVersionsResponse.DeleteMarkers.map((marker) => ({
          Key: marker.Key!,
          VersionId: marker.VersionId,
        })),
      );
    }

    if (objectsToDelete.length > 0) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: {
            Objects: objectsToDelete,
          },
        }),
      );
    }

    nextKeyMarker = listVersionsResponse.NextKeyMarker;
    nextVersionIdMarker = listVersionsResponse.NextVersionIdMarker;
  } while (nextKeyMarker);

  if (nextKeyMarker === undefined && nextVersionIdMarker === undefined) {
    let continuationToken: string | undefined;
    do {
      const listResponse = await s3.send(
        new ListObjectsV2Command({
          Bucket: bucketName,
          ContinuationToken: continuationToken,
        }),
      );

      if (listResponse.Contents && listResponse.Contents.length > 0) {
        await s3.send(
          new DeleteObjectsCommand({
            Bucket: bucketName,
            Delete: {
              Objects: listResponse.Contents.map((object) => ({ Key: object.Key })),
            },
          }),
        );
      }

      continuationToken = listResponse.NextContinuationToken;
    } while (continuationToken);
  }
};

const deleteS3Bucket = async (params: { s3: S3Client; bucketName: string }): Promise<void> => {
  // First, delete all objects from the bucket
  await deleteAllObjectsFromBucket(params.s3, params.bucketName);

  // Then, delete the empty bucket
  await params.s3.send(new DeleteBucketCommand({ Bucket: params.bucketName }));
};

/**
 * @description Deletes a specific deployment's state file from S3 and its lock entry from DynamoDB.
 * @param params - The parameters for deleting the deployment state.
 */
export const deleteDeploymentState = async (params: {
  credentials: AwsCredentialIdentity;
  dynamoDBTableName: string;
  bucketName: string;
  awsRegion: string;
  tfStateKey: string;
}): Promise<void> => {
  const s3 = new S3Client({
    region: params.awsRegion,
    credentials: params.credentials,
  });

  // Delete the state file from S3
  await s3.send(
    new DeleteObjectCommand({
      Bucket: params.bucketName,
      Key: params.tfStateKey,
    }),
  );
  info('Deleted state file from S3', {
    bucketName: params.bucketName,
    key: params.tfStateKey,
  });

  // Delete the lock entry from DynamoDB if it exists
  const dynamoDB = new DynamoDBClient({
    region: params.awsRegion,
    credentials: params.credentials,
  });

  // LockID format for Terraform S3 backend: <bucket>/<key>
  const lockId = `${params.bucketName}/${params.tfStateKey}`;
  try {
    await dynamoDB.send(
      new DeleteItemCommand({
        TableName: params.dynamoDBTableName,
        Key: {
          LockID: { S: lockId },
        },
      }),
    );
    info('Deleted lock entry from DynamoDB', {
      tableName: params.dynamoDBTableName,
      lockId,
    });
  } catch (e) {
    // DeleteItem is idempotent and does not error for a non-existent item.
    error('Error deleting lock entry from DynamoDB', {
      tableName: params.dynamoDBTableName,
      lockId,
      error: e.message,
      stack: e.stack,
      code: e.code,
    });
    throw e;
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
  info('Connecting to Terraform State stored on AWS', {
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
  info('Connected successfully to Terraform State stored on AWS');
};
