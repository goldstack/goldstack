/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { S3Client } from '@aws-sdk/client-s3';
import { fromEnv } from '@aws-sdk/credential-providers';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import { excludeInBundle } from '@goldstack/utils-esbuild';
import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import type { Client, Command } from '@smithy/smithy-client';

import type { MetadataBearer, RequestPresigningArguments } from '@smithy/types';
import assert from 'assert';
import { getLocalBucketName, getMockedS3, isMocked, resetMocksIfRequired } from './connectLocal';
import type { S3Deployment, S3Package } from './types/S3Package';

export const connect = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentName?: string,
): Promise<S3Client> => {
  const packageConfig = new EmbeddedPackageConfig<S3Package, S3Deployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });
  if (!deploymentName) {
    assert(
      process.env.GOLDSTACK_DEPLOYMENT,
      `Cannot connect to S3 bucket for package ${goldstackConfig.name}. Either specify a deploymentName or ensure environment variable GOLDSTACK_DEPLOYMENT is defined.`,
    );
    deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
  }
  if (deploymentName === 'local') {
    // only require this for local testing

    return getMockedS3(goldstackConfig);
  } else {
    resetMocksIfRequired(deploymentName, goldstackConfig);
  }
  const deployment = packageConfig.getDeployment(deploymentName);

  let awsUser: AwsCredentialIdentityProvider;
  if (process.env.AWS_ACCESS_KEY_ID) {
    awsUser = fromEnv();
  } else {
    // load this in lazy to enable omitting the dependency when bundling lambdas

    const infraAWSLib = require(excludeInBundle('@goldstack/infra-aws'));
    awsUser = await infraAWSLib.getAWSUser(deployment.awsUser);
  }

  const s3 = new S3Client({
    credentials: awsUser,
    region: deployment.awsRegion,
  });

  return s3;
};

export const getSignedUrlS3 = async <
  InputTypesUnion extends object,
  InputType extends InputTypesUnion,
  OutputType extends MetadataBearer = MetadataBearer,
>(
  client: Client<any, InputTypesUnion, MetadataBearer, any>,
  command: Command<InputType, OutputType, any, InputTypesUnion, MetadataBearer>,
  options: RequestPresigningArguments = {},
): Promise<string> => {
  if (isMocked(client as any)) {
    return 'http://localhost/mockedAWSS3';
  }
  return getSignedUrl(client, command, options);
};

export const getBucketName = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentName?: string,
): Promise<string> => {
  const packageConfig = new EmbeddedPackageConfig<S3Package, S3Deployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });
  if (!deploymentName) {
    assert(
      process.env.GOLDSTACK_DEPLOYMENT,
      `Cannot get S3 bucket name for package ${goldstackConfig.name}. Either specify a deploymentName or ensure environment variable GOLDSTACK_DEPLOYMENT is defined.`,
    );
    deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
  }
  if (deploymentName === 'local') {
    return getLocalBucketName(goldstackConfig);
  }
  const deployment = packageConfig.getDeployment(deploymentName);
  return deployment.configuration.bucketName;
};
