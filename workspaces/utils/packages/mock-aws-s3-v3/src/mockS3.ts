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
  PutObjectCommand,
  PutObjectTaggingCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import S3Mock from 'mock-aws-s3';

import {
  Command,
  MetadataBearer,
  StreamingBlobPayloadOutputTypes,
} from '@smithy/types';
import { WriteStream } from 'fs';

export function createS3Client(s3Client?: S3Client): S3Client {
  if (!s3Client) {
    s3Client = new S3Client();
  }
  const client = mockClient(S3Client);

  S3Mock.config.basePath = 'goldstackLocal/s3';
  const mockS3 = new S3Mock.S3({
    params: {},
  });

  client.on(PutObjectCommand).callsFake(async (input): Promise<any> => {
    return await mockS3.putObject(input).promise();
  });

  client.on(GetObjectCommand).callsFake(async (input): Promise<any> => {
    const resOperation = mockS3.getObject(input);

    const output: GetObjectOutput = {};

    const body: StreamingBlobPayloadOutputTypes = {
      transformToString: async () =>
        (await resOperation.promise()).Body?.toString() || '',
      pipe: (destination: WriteStream, options?) => {
        return resOperation.createReadStream().pipe(destination, options);
      },
    } as any;
    output.Body = body;
    return output;
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
