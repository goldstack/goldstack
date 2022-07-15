import { LambdaApiDeploymentConfiguration } from '@goldstack/utils-aws-lambda';
import { upload } from '@goldstack/utils-s3-deployment';
import type { AWSDeployment } from '@goldstack/infra-aws';

export interface DeployToS3Params {
  configuration: LambdaApiDeploymentConfiguration;
  deployment: AWSDeployment;
}
export const deployToS3 = async (params: DeployToS3Params): Promise<void> => {
  await Promise.all([
    upload({
      bucket: `${params.configuration.apiDomain}-public-files`,
      bucketPath: '/',
      localPath: 'public/',
      region: params.deployment.awsRegion,
      userName: params.deployment.awsUser,
    }),
    // uploading files again to allow CloudFront routing both to the root
    // and the subdirectory
    upload({
      bucket: `${params.configuration.apiDomain}-public-files`,
      bucketPath: '/_goldstack/public',
      localPath: 'public/',
      region: params.deployment.awsRegion,
      userName: params.deployment.awsUser,
    }),
    upload({
      bucket: `${params.configuration.apiDomain}-static-files`,
      bucketPath: '/_goldstack/static',
      localPath: 'static/',
      region: params.deployment.awsRegion,
      userName: params.deployment.awsUser,
    }),
  ]);
};
