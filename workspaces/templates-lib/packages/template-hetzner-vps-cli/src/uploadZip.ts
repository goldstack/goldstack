import { HetznerVPSDeployment } from '@goldstack/template-hetzner-vps';
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

  await upload({
    userName,
    bucketPath: '/server/',
    region: deployment.awsRegion,
    bucket: deployment.configuration.deploymentsS3Bucket,
    localPath: './dist/app',
  });
}
