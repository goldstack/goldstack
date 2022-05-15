/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { getAWSUser } from '@goldstack/infra-aws';
import S3 from 'aws-sdk/clients/s3';

import { S3Package, S3Deployment } from './types/S3Package';
import AWSMock from 'mock-aws-s3';
import assert from 'assert';

import { PackageConfig } from '@goldstack/utils-package-config';

export const connect = async (
  goldstackConfig: any,
  packageSchema: any,
  deploymentName?: string
): Promise<S3> => {
  const packageConfig = new PackageConfig<S3Package, S3Deployment>({
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
    AWSMock.config.basePath = 'goldstackLocal/s3';
    const s3: AWSMock.S3 = new AWSMock.S3({
      params: {},
    });
    return s3 as any;
  }
  const deployment = packageConfig.getDeployment(deploymentName);

  const awsUser = await getAWSUser(deployment.awsUser);

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
  const packageConfig = new PackageConfig<S3Package, S3Deployment>({
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
