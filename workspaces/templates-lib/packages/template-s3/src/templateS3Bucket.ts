/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Credentials, EnvironmentCredentials } from 'aws-sdk/lib/core';
import S3 from 'aws-sdk/clients/s3';
import { excludeInBundle } from '@goldstack/utils-esbuild';
import { S3Package, S3Deployment } from './types/S3Package';
import assert from 'assert';

import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';

export const connect = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentName?: string
): Promise<S3> => {
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
    const AWSMock = require(excludeInBundle('mock-aws-s3'));
    AWSMock.config.basePath = 'goldstackLocal/s3';
    const s3 = new AWSMock.S3({
      params: {},
    });
    return s3 as any;
  }
  const deployment = packageConfig.getDeployment(deploymentName);

  let awsUser: Credentials;
  if (process.env.AWS_ACCESS_KEY_ID) {
    awsUser = new EnvironmentCredentials('AWS');
  } else {
    // load this in lazy to enable omitting the dependency when bundling lambdas
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const infraAWSLib = require(excludeInBundle('@goldstack/infra-aws'));
    awsUser = await infraAWSLib.getAWSUser(deployment.awsUser);
  }

  const s3 = new S3({
    apiVersion: '2006-03-01',
    credentials: awsUser,
    region: deployment.awsRegion,
  });

  return s3;
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
