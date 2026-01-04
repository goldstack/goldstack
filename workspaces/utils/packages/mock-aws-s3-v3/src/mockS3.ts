import {
  CopyObjectCommand,
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  type GetObjectOutput,
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
import type { StreamingBlobPayloadOutputTypes } from '@smithy/types';
import { mockClient } from 'aws-sdk-client-mock';
import type { WriteStream } from 'fs';
import * as s3Mock from 'mock-aws-s3';
import { type AWSError } from 'mock-aws-s3';
import { resolve } from 'path';

/**
 * Represents the context for a mocked S3 bucket instance
 */
interface BucketContext {
  /** The S3 client instance */
  client: S3Client;
  /** The mocked client instance */
  mockClient: ReturnType<typeof mockClient>;
  /** The mock S3 implementation */
  // biome-ignore lint/suspicious/noExplicitAny: Mock S3 implementation type is complex and varies
  mockS3: any;
  /** The local directory for this bucket */
  localDirectory: string;
}

/**
 * Creates a NoSuchKey error with expected properties set
 * @param error - The error containing the message
 * @returns A NoSuchKey instance with all expected properties
 */
function mockNoSuchKey(error: { message: string }): NoSuchKey {
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-s3/Class/NoSuchKey/
  const noSuchKey = new NoSuchKey({
    message: error.message,
    $metadata: {
      httpStatusCode: 404,
    },
  });
  // biome-ignore lint/suspicious/noExplicitAny: AWS SDK error extension properties
  (noSuchKey as any).$fault = 'client';
  // biome-ignore lint/suspicious/noExplicitAny: AWS SDK error extension properties
  (noSuchKey as any).$response = {
    statusCode: 404,
  };
  // biome-ignore lint/suspicious/noExplicitAny: AWS SDK error extension properties
  (noSuchKey as any).$retryable = {
    throttling: false,
  };
  return noSuchKey;
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
function getBucketContext(bucket: string): BucketContext | undefined {
  const context = bucketContexts.get(bucket);
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
  const clientSend = client.send.bind(client);
  const mockClientInstance = mockClient(client);

  s3Mock.config.basePath = resolve(localDirectory);
  const mockS3 = new s3Mock.S3({
    params: { Bucket: bucket },
    region: 'us-west-2',
  });

  context = {
    client,
    mockClient: mockClientInstance,
    mockS3,
    localDirectory: resolve(localDirectory),
  };

  bucketContexts.set(bucket, context);
  // biome-ignore lint/suspicious/noExplicitAny: Adding custom property to client for debugging
  (client as any)._goldstackRequests = [];

  // Setup standard S3 operations
  type S3Operation = {
    // biome-ignore lint/suspicious/noExplicitAny: AWS SDK command types vary
    command: any;
    method: (keyof typeof mockS3 & string) | undefined;
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
    { command: ListBucketsCommand, method: undefined }, // not supported
  ];

  // mockClientInstance.onAnyCommand((input: any) => {
  //   throw new Error(
  //     'Unrecognised command for AWS Mock Library. Please ensure you are not using incompatible AWS SDK versions.',
  //   );
  // });
  operations.forEach(({ command, method }) => {
    // biome-ignore lint/suspicious/noExplicitAny: AWS SDK input and return types vary
    mockClientInstance.on(command).callsFake(async (input: any): Promise<any> => {
      const context = getBucketContext(input.Bucket);
      if (!context) {
        // if no context defined for bucket, warn and fall back to real client
        console.warn(
          `Bucket '${input.Bucket}' is not mocked. Falling back to real AWS S3 client. Only buckets created with createS3Client() can be accessed through this mock client.`,
        );
        const commandWithInput = new command(input);
        return await clientSend(commandWithInput);
      }
      if (!method) {
        throw new Error(`Method ${command.name} not implemented.`);
      }
      s3Mock.config.basePath = context.localDirectory;
      // biome-ignore lint/suspicious/noExplicitAny: Adding custom property to client for debugging
      (context.client as any)._goldstackRequests.push({
        command: command.name,
        input,
      });

      if (process.env.GOLDSTACK_DEBUG) {
        console.debug(
          `Performing command ${command.name} on mock S3 bucket ${input.Bucket}.\n  Folder for local bucket: ${context.localDirectory}`,
        );
      }
      const operation = context.mockS3[method](input);

      if (method === 'getObject') {
        // biome-ignore lint/suspicious/noExplicitAny: Stream type varies based on mock implementation
        let stream: any;
        try {
          const res = await operation.promise();
          // biome-ignore lint/suspicious/noExplicitAny: Mock response type varies
          const output: GetObjectOutput = { ...(res as any) };

          const body: StreamingBlobPayloadOutputTypes = {
            transformToString: async (encoding?: string) => res.Body?.toString(encoding) || '',
            transformToByteArray: async () => {
              const content = res.Body?.toString() || '';
              return new Uint8Array(Buffer.from(content));
            },
            transformToWebStream: () => {
              stream = operation.createReadStream();
              return stream;
            },
            pipe: (destination: WriteStream, options?) => {
              stream = operation.createReadStream();
              return stream.pipe(destination, options);
            },
            // biome-ignore lint/suspicious/noExplicitAny: Body implementation requires type assertion
          } as any;

          output.Body = body;
          return output;
        } catch (e) {
          if (stream) {
            stream.destroy();
          }

          const awsError = e as AWSError;
          if (awsError.code === 'NoSuchKey') {
            throw mockNoSuchKey(e);
          }
          throw e;
        }
      }

      if (['headObject', 'getObjectTagging', 'putObjectTagging', 'copyObject'].includes(method)) {
        try {
          const result = await operation.promise();
          if (method === 'headObject' && result === undefined) {
            throw mockNoSuchKey({ message: 'The specified key does not exist.' });
          }
          return result;
        } catch (e) {
          const awsError = e as AWSError;
          if (awsError.code === 'NoSuchKey' || awsError.code === 'ENOENT') {
            throw mockNoSuchKey(e);
          }
          throw e;
        }
      }

      return await operation.promise();
    });
  });

  return client;
}
