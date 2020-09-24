import {
  connect as templateConnect,
  getBucketName as tempalteGetBucketName,
} from '@goldstack/template-s3';

import S3 from 'aws-sdk/clients/s3';
import goldstackConfig from './../goldstack.json';
import goldstackSchema from './../schemas/package.schema.json';

export const connect = async (deploymentName?: string): Promise<S3> => {
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
