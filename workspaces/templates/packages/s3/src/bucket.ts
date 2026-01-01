import type { S3Client } from '@aws-sdk/client-s3';
import {
  connect as templateConnect,
  getBucketName as templateGetBucketName,
  getSignedUrlS3 as templateGetSignedUrl,
} from '@goldstack/template-s3';
import type { Client, Command } from '@smithy/smithy-client';
import type { MetadataBearer, RequestPresigningArguments } from '@smithy/types';

import goldstackConfig from './../goldstack.json';
import goldstackSchema from './../schemas/package.schema.json';

/**
 * Connects to the S3 bucket for the specified deployment.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns A promise that resolves with an S3Client instance.
 */
export const connect = async (deploymentName?: string): Promise<S3Client> => {
  return await templateConnect(goldstackConfig, goldstackSchema, deploymentName);
};

/**
 * Generates a pre-signed URL for an S3 operation.
 *
 * @typeParam InputTypesUnion - The union of all possible input types for the client.
 * @typeParam InputType - The specific input type for the command.
 * @typeParam OutputType - The output type for the command.
 * @param client - The S3 client to use for generating the signed URL.
 * @param command - The S3 command to generate a signed URL for.
 * @param options - Optional presigning arguments.
 * @returns A promise that resolves with the pre-signed URL string.
 */
export const getSignedUrl = async <
  InputTypesUnion extends object,
  InputType extends InputTypesUnion,
  OutputType extends MetadataBearer = MetadataBearer,
>(
  client: Client<any, InputTypesUnion, MetadataBearer, any>,
  command: Command<InputType, OutputType, any, InputTypesUnion, MetadataBearer>,
  options: RequestPresigningArguments = {},
): Promise<string> => {
  return templateGetSignedUrl(client, command, options);
};

/**
 * Gets the name of the S3 bucket for the specified deployment.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns A promise that resolves with the bucket name string.
 */
export const getBucketName = async (deploymentName?: string): Promise<string> => {
  return await templateGetBucketName(goldstackConfig, goldstackSchema, deploymentName);
};
