import {
  connect as templateConnect,
  getBucketName as templateGetBucketName,
} from '@goldstack/template-s3';

import { S3Client } from '@aws-sdk/client-s3';
import goldstackConfig from './../goldstack.json';
import goldstackSchema from './../schemas/package.schema.json';

export const connect = async (deploymentName?: string): Promise<S3Client> => {
  return await templateConnect(
    goldstackConfig,
    goldstackSchema,
    deploymentName
  );
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
