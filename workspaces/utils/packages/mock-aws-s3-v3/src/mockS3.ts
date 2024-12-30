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
import { AWSError, S3 } from 'mock-aws-s3';
import { StreamingBlobPayloadOutputTypes } from '@smithy/types';
import { WriteStream } from 'fs';
import { resolve } from 'path';
import * as s3Mock from 'mock-aws-s3';

/**
 * Represents the context for a mocked S3 bucket instance
 */
interface BucketContext {
  /** The S3 client instance */
  client: S3Client;
  /** The mocked client instance */
  mockClient: ReturnType<typeof mockClient>;
  /** The mock S3 implementation */
  mockS3: any;
  /** The local directory for this bucket */
  localDirectory: string;
}

const bucketContexts = new Map<string, BucketContext>();

/**
 * Resets mocks for a specific bucket. If no bucket provided, resets all mocks.
 * @param bucket - Optional bucket name to reset
 */
export function resetMocks(bucket?: string): void {
  if (bucket) {
    bucketContexts.delete(bucket);
  } else {
    bucketContexts.clear();
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
 * Validates and retrieves bucket context, throwing an error if not found
 * @param bucket - Bucket name to validate
 * @returns BucketContext for the specified bucket
 */
function validateBucketContext(bucket: string): BucketContext {
  const context = bucketContexts.get(bucket);
  if (!context) {
    throw new Error(
      `Attempting to mock call to s3 client for which bucket was not mocked: ${bucket}`
    );
  }
  return context;
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
  if (!bucket) {
    throw new Error('Bucket name is required');
  }

  if (!localDirectory) {
    throw new Error('Local directory is required');
  }

  let context = bucketContexts.get(bucket);
  if (context) {
    return context.client;
  }

  const client = s3Client || new S3Client();
  const mockClientInstance = mockClient(client);

  const mockS3 = new s3Mock.S3({
    params: { Bucket: bucket },
  });

  context = {
    client,
    mockClient: mockClientInstance,
    mockS3,
    localDirectory: resolve(localDirectory),
  };

  bucketContexts.set(bucket, context);
  (client as any)._goldstackRequests = [];

  // Setup standard S3 operations
  type S3Operation = {
    command: any;
    method: keyof typeof mockS3 & string;
  };

  const operations: S3Operation[] = [
    { command: PutObjectCommand, method: 'putObject' },
    { command: GetObjectCommand, method: 'getObject' },
    { command: CreateBucketCommand, method: 'createBucket' },
    { command: DeleteBucketCommand, method: 'deleteBucket' },
    { command: ListObjectsCommand, method: 'listObjects' },
    { command: ListObjectsV2Command, method: 'listObjectsV2' },
    { command: DeleteObjectsCommand, method: 'deleteObjects' },
    { command: DeleteObjectCommand, method: 'deleteObject' },
    { command: HeadObjectCommand, method: 'headObject' },
    { command: CopyObjectCommand, method: 'copyObject' },
    { command: GetObjectTaggingCommand, method: 'getObjectTagging' },
    { command: PutObjectTaggingCommand, method: 'putObjectTagging' },
  ];

  operations.forEach(({ command, method }) => {
    mockClientInstance
      .on(command)
      .callsFake(async (input: any): Promise<any> => {
        const context = validateBucketContext(input.Bucket);
        s3Mock.config.basePath = context.localDirectory;
        (context.client as any)._goldstackRequests.push({
          command: command.name,
          input,
        });

        const operation = context.mockS3[method](input);

        if (method === 'getObject') {
          let stream: any;
          try {
            const res = await operation.promise();
            const output: GetObjectOutput = { ...(res as any) };

            const body: StreamingBlobPayloadOutputTypes = {
              transformToString: async () => res.Body?.toString() || '',
              pipe: (destination: WriteStream, options?) => {
                stream = operation.createReadStream();
                return stream.pipe(destination, options);
              },
            } as any;

            output.Body = body;
            return output;
          } catch (e) {
            if (stream) {
              stream.destroy();
            }

            const awsError = e as AWSError;
            if (awsError.code === 'NoSuchKey') {
              throw new NoSuchKey({
                message: e.message,
                $metadata: {},
              });
            }
            throw e;
          }
        }

        return await operation.promise();
      });
  });

  // Mark unsupported operations
  mockClientInstance
    .on(ListBucketsCommand)
    .rejects(`Method ${ListBucketsCommand.name} not implemented.`);

  return client;
}
