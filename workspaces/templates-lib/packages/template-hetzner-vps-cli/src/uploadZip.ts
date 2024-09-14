import { HetznerVPSDeployment } from '@goldstack/template-hetzner-vps';
import { logger } from '@goldstack/utils-cli';
import { upload } from '@goldstack/utils-s3-deployment';

export interface UploadZipParams {
  deployment: HetznerVPSDeployment;
}

export async function uploadZip({ deployment }: UploadZipParams) {
  const userName = deployment.awsUser;

  if (!deployment.configuration.deploymentsS3Bucket) {
    throw new Error(
      'Cannot upload server files. Deployments S3 bucket is not defined.'
    );
  }

  logger().info('Uploading application files to S3 bucket');

  await upload({
    userName,
    bucketPath: '/server/',
    region: deployment.awsRegion,
    bucket: deployment.configuration.deploymentsS3Bucket,
    localPath: './dist/app',
  });
}
