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
  NoSuchKey,
  PutObjectCommand,
  PutObjectTaggingCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import S3Mock, { AWSError } from 'mock-aws-s3';

import { StreamingBlobPayloadOutputTypes } from '@smithy/types';
import { WriteStream } from 'fs';

export function createS3Client(
  localDirectory: string,
  s3Client?: S3Client
): S3Client {
  if (!s3Client) {
    s3Client = new S3Client();
  }
  const client = mockClient(S3Client);

  S3Mock.config.basePath = localDirectory;
  const mockS3 = new S3Mock.S3({
    params: {},
  });

  client.on(PutObjectCommand).callsFake(async (input): Promise<any> => {
    return await mockS3.putObject(input).promise();
  });

  client.on(GetObjectCommand).callsFake(async (input): Promise<any> => {
    const resOperation = mockS3.getObject(input);

    try {
      const res = await resOperation.promise();

      const output: GetObjectOutput = { ...(res as any) };

      const body: StreamingBlobPayloadOutputTypes = {
        toString: () => res.Body?.toString(),
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

  wrappedAsIs(client, mockS3, CreateBucketCommand, 'createBucket');
  wrappedAsIs(client, mockS3, DeleteBucketCommand, 'deleteBucket');
  wrappedAsIs(client, mockS3, ListObjectsCommand, 'listObjects');
  wrappedAsIs(client, mockS3, DeleteObjectsCommand, 'deleteObjects');
  wrappedAsIs(client, mockS3, DeleteObjectCommand, 'deleteObject');
  wrappedAsIs(client, mockS3, HeadObjectCommand, 'headObject');
  wrappedAsIs(client, mockS3, CopyObjectCommand, 'copyObject');
  wrappedAsIs(client, mockS3, GetObjectTaggingCommand, 'getObjectTagging');
  wrappedAsIs(client, mockS3, PutObjectTaggingCommand, 'putObjectTagging');

  notSupported(client, ListBucketsCommand);
  return s3Client;
}

function wrappedAsIs(
  client: any,
  mockS3: any,
  command: any,
  methodName: string
) {
  client.on(command).callsFake(async (input: any): Promise<any> => {
    return await mockS3[methodName](input).promise();
  });
}

function notSupported(client: any, command: any) {
  client.on(command).rejects('Method ' + command.name + ' not implemented.');
}
