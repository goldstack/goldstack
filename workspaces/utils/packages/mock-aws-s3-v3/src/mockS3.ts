import {
  CopyObjectCommand,
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  GetObjectOutput,
  GetObjectTaggingCommand,
  HeadObjectCommand,
  ListBucketsCommand,
  ListObjectsCommand,
  ListObjectsV2Command,
  NoSuchKey,
  PutObjectCommand,
  PutObjectTaggingCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import S3Mock, { AWSError } from 'mock-aws-s3';

import { StreamingBlobPayloadOutputTypes } from '@smithy/types';
import { WriteStream } from 'fs';

const clientsByBucket = new Map<string, S3Client>();
const mockClientsByBucket = new Map<string, ReturnType<typeof mockClient>>();
const mockS3ByBucket = new Map<string, any>();

/**
 * Resets mocks for a specific bucket. If no bucket provided, resets all mocks.
 */
export function resetMocks(bucket?: string) {
  if (bucket) {
    clientsByBucket.delete(bucket);
    mockClientsByBucket.delete(bucket);
    mockS3ByBucket.delete(bucket);
  } else {
    clientsByBucket.clear();
    mockClientsByBucket.clear();
    mockS3ByBucket.clear();
  }
}

/**
 * Interface for S3 client creation options
 */
export interface CreateS3ClientOptions {
  /** Local directory to store mock data */
  localDirectory: string;
  /** Optional S3 client instance */
  s3Client?: S3Client;
  /** Bucket name for this mock instance */
  bucket: string;
}

/**
 * Creates a mocked S3 instance for a specific bucket.
 * Each bucket gets its own mock instance to prevent interference.
 */
export function createS3Client({
  localDirectory,
  s3Client,
  bucket,
}: CreateS3ClientOptions): S3Client {
  if (!s3Client) {
    s3Client = clientsByBucket.get(bucket) || new S3Client();
    clientsByBucket.set(bucket, s3Client);
  }

  if (!mockClientsByBucket.has(bucket)) {
    const client = mockClient(s3Client);
    mockClientsByBucket.set(bucket, client);

    S3Mock.config.basePath = localDirectory;
    const mockS3 = new S3Mock.S3({
      params: { Bucket: bucket },
    });
    mockS3ByBucket.set(bucket, mockS3);

    (s3Client as any)._goldstackRequests = [];

    client.on(PutObjectCommand).callsFake(async (input): Promise<any> => {
      (s3Client as any)._goldstackRequests.push({
        command: 'PutObject',
        input,
      });
      return await mockS3.putObject(input).promise();
    });

    client.on(GetObjectCommand).callsFake(async (input): Promise<any> => {
      (s3Client as any)._goldstackRequests.push({
        command: 'GetObject',
        input,
      });
      const resOperation = mockS3.getObject(input);

      try {
        const res = await resOperation.promise();

        const output: GetObjectOutput = { ...(res as any) };

        const body: StreamingBlobPayloadOutputTypes = {
          transformToString: async () => res.Body?.toString() || '',
          pipe: (destination: WriteStream, options?) => {
            return resOperation.createReadStream().pipe(destination, options);
          },
        } as any;
        output.Body = body;
        return output;
      } catch (e) {
        const awsError = e as AWSError;
        if (awsError.code === 'NoSuchKey') {
          throw new NoSuchKey({
            message: e.message,
            $metadata: {},
          });
        }
        throw e;
      }
    });

    wrappedAsIs(client, mockS3, CreateBucketCommand, 'createBucket', s3Client);
    wrappedAsIs(client, mockS3, DeleteBucketCommand, 'deleteBucket', s3Client);
    wrappedAsIs(client, mockS3, ListObjectsCommand, 'listObjects', s3Client);
    wrappedAsIs(
      client,
      mockS3,
      ListObjectsV2Command,
      'listObjectsV2',
      s3Client
    );
    wrappedAsIs(
      client,
      mockS3,
      DeleteObjectsCommand,
      'deleteObjects',
      s3Client
    );
    wrappedAsIs(client, mockS3, DeleteObjectCommand, 'deleteObject', s3Client);
    wrappedAsIs(client, mockS3, HeadObjectCommand, 'headObject', s3Client);
    wrappedAsIs(client, mockS3, CopyObjectCommand, 'copyObject', s3Client);
    wrappedAsIs(
      client,
      mockS3,
      GetObjectTaggingCommand,
      'getObjectTagging',
      s3Client
    );
    wrappedAsIs(
      client,
      mockS3,
      PutObjectTaggingCommand,
      'putObjectTagging',
      s3Client
    );

    notSupported(client, ListBucketsCommand);
  }

  return s3Client;
}

function wrappedAsIs(
  client: any,
  mockS3: any,
  command: any,
  methodName: string,
  s3Client: S3Client
) {
  client.on(command).callsFake(async (input: any): Promise<any> => {
    (s3Client as any)._goldstackRequests.push({ command: command.name, input });
    return await mockS3[methodName](input).promise();
  });
}

function notSupported(client: any, command: any) {
  client.on(command).rejects('Method ' + command.name + ' not implemented.');
}
