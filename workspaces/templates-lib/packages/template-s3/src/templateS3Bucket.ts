/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { fromEnv } from '@aws-sdk/credential-providers';
import { S3Client } from '@aws-sdk/client-s3';
import { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import { excludeInBundle } from '@goldstack/utils-esbuild';
import { S3Package, S3Deployment } from './types/S3Package';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import assert from 'assert';

import { MetadataBearer, RequestPresigningArguments } from '@smithy/types';
import { Client, Command } from '@smithy/smithy-client';

import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';

import { warn } from '@goldstack/utils-log';

let s3MockUsed = false;

export const connect = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentName?: string
): Promise<S3Client> => {
  const packageConfig = new EmbeddedPackageConfig<S3Package, S3Deployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });
  if (!deploymentName) {
    assert(
      process.env.GOLDSTACK_DEPLOYMENT,
      `Cannot connect to S3 bucket for package ${goldstackConfig.name}. Either specify a deploymentName or ensure environment variable GOLDSTACK_DEPLOYMENT is defined.`
    );
    deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
  }
  if (deploymentName === 'local') {
    // only require this for local testing
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const MockS3 = require(excludeInBundle('mock-aws-s3-v3'));
    const s3 = MockS3.createS3Client('goldstackLocal/s3');

    (s3 as any)._goldstackIsMocked = true;
    s3MockUsed = true;
    return s3 as any;
  } else {
    if (s3MockUsed) {
      warn(
        'Initialising a real S3 bucket after a mocked one had been created it. All mocks are reset.',
        {
          deploymentName,
          package: goldstackConfig.name,
        }
      );
      // only require this for local testing
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const MockS3 = require(excludeInBundle('mock-aws-s3-v3'));
      MockS3.resetMocks();
    }
  }
  const deployment = packageConfig.getDeployment(deploymentName);

  let awsUser: AwsCredentialIdentityProvider;
  if (process.env.AWS_ACCESS_KEY_ID) {
    awsUser = fromEnv();
  } else {
    // load this in lazy to enable omitting the dependency when bundling lambdas
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const infraAWSLib = require(excludeInBundle('@goldstack/infra-aws'));
    awsUser = await infraAWSLib.getAWSUser(deployment.awsUser);
  }

  const s3 = new S3Client({
    credentials: awsUser,
    region: deployment.awsRegion,
  });

  return s3;
};

export const isMocked = (client: S3Client): boolean => {
  return (client as any)._goldstackIsMocked === true;
};

export const getSignedUrlS3 = async <
  InputTypesUnion extends object,
  InputType extends InputTypesUnion,
  OutputType extends MetadataBearer = MetadataBearer
>(
  client: Client<any, InputTypesUnion, MetadataBearer, any>,
  command: Command<InputType, OutputType, any, InputTypesUnion, MetadataBearer>,
  options: RequestPresigningArguments = {}
): Promise<string> => {
  if (isMocked(client as any)) {
    return 'http://localhost/mockedAWSS3';
  }
  return getSignedUrl(client, command, options);
};

export const getBucketName = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentName?: string
): Promise<string> => {
  const packageConfig = new EmbeddedPackageConfig<S3Package, S3Deployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });
  if (!deploymentName) {
    assert(
      process.env.GOLDSTACK_DEPLOYMENT,
      `Cannot get S3 bucket name for package ${goldstackConfig.name}. Either specify a deploymentName or ensure environment variable GOLDSTACK_DEPLOYMENT is defined.`
    );
    deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
  }
  if (deploymentName === 'local') {
    return `local-${goldstackConfig.name}`;
  }
  const deployment = packageConfig.getDeployment(deploymentName);
  return deployment.configuration.bucketName;
};
