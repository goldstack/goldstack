import {
  connect as templateConnect,
  getBucketName as templateGetBucketName,
  getSignedUrlS3 as templateGetSignedUrl,
} from '@goldstack/template-s3';

import type { S3Client } from '@aws-sdk/client-s3';

import type { MetadataBearer, RequestPresigningArguments } from '@smithy/types';
import type { Client, Command } from '@smithy/smithy-client';

import goldstackConfig from './../goldstack.json';
import goldstackSchema from './../schemas/package.schema.json';

export const connect = async (deploymentName?: string): Promise<S3Client> => {
  return await templateConnect(
    goldstackConfig,
    goldstackSchema,
    deploymentName
  );
};

export const getSignedUrl = async <
  InputTypesUnion extends object,
  InputType extends InputTypesUnion,
  OutputType extends MetadataBearer = MetadataBearer
>(
  client: Client<any, InputTypesUnion, MetadataBearer, any>,
  command: Command<InputType, OutputType, any, InputTypesUnion, MetadataBearer>,
  options: RequestPresigningArguments = {}
): Promise<string> => {
  return templateGetSignedUrl(client, command, options);
};

export const getBucketName = async (
  deploymentName?: string
): Promise<string> => {
  return await templateGetBucketName(
    goldstackConfig,
    goldstackSchema,
    deploymentName
  );
};
