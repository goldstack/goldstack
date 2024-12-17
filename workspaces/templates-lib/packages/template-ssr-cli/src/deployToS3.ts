import { LambdaApiDeploymentConfiguration } from '@goldstack/utils-aws-lambda';
import { upload } from '@goldstack/utils-s3-deployment';
import type { AWSDeployment } from '@goldstack/infra-aws';
import path from 'path';

export interface DeployToS3Params {
  configuration: LambdaApiDeploymentConfiguration;
  deployment: AWSDeployment;
  staticFilesBucket: string;
  publicFilesBucket: string;
  packageRootFolder: string;
}
export const deployToS3 = async (params: DeployToS3Params): Promise<void> => {
  await Promise.all([
    upload({
      bucket: params.publicFilesBucket,
      bucketPath: '/',
      localPath: path.join(params.packageRootFolder, 'public/'),
      region: params.deployment.awsRegion,
      userName: params.deployment.awsUser,
    }),
    // uploading files again to allow CloudFront routing both to the root
    // and the subdirectory
    upload({
      bucket: params.staticFilesBucket,
      bucketPath: '/_goldstack/public',
      localPath: path.join(params.packageRootFolder, 'public/'),
      region: params.deployment.awsRegion,
      userName: params.deployment.awsUser,
    }),
    upload({
      bucket: params.staticFilesBucket,
      bucketPath: '/_goldstack/static',
      localPath: path.join(params.packageRootFolder, 'static/'),
      cacheControl: 'max-age=31536000,immutable,public',
      region: params.deployment.awsRegion,
      userName: params.deployment.awsUser,
      skipDelete: true, // we want to keep static files in place
    }),
  ]);
};
