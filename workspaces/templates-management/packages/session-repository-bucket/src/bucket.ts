import {
  connect as templateConnect,
  getBucketName as tempalteGetBucketName,
} from '@goldstack/template-s3';

import goldstackSchema from './../schemas/package.schema.json';
import { S3Client } from '@aws-sdk/client-s3';
import goldstackConfig from './../goldstack.json';

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
  return await tempalteGetBucketName(
    goldstackConfig,
    goldstackSchema,
    deploymentName
  );
};
