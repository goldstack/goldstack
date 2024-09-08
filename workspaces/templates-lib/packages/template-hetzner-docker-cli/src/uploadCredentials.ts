import { HetznerDockerDeployment } from '@goldstack/template-hetzner-docker';
import { upload } from '@goldstack/utils-s3-deployment';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getAWSCredentials, getAWSUser } from '@goldstack/infra-aws';

export interface UploadCredentialsParams {
  deployment: HetznerDockerDeployment;
}

export async function uploadCredentials({
  deployment,
}: UploadCredentialsParams): Promise<{
  url: string;
}> {
  const userName = deployment.awsUser;

  if (!deployment.configuration.deploymentsS3Bucket) {
    throw new Error(
      'Cannot upload server files. Deployments S3 bucket is not defined.'
    );
  }

  await upload({
    userName,
    bucketPath: 'credentials/',
    region: deployment.awsRegion,
    bucket: deployment.configuration.deploymentsS3Bucket,
    localPath: './dist/credentials',
  });

  const url = await generateReadOnlyUrl(deployment);
  return {
    url,
  };
}

async function generateReadOnlyUrl(
  deployment: HetznerDockerDeployment
): Promise<string> {
  if (!deployment.configuration.deploymentsS3Bucket) {
    throw new Error(
      'Cannot generate URL. Deployments S3 bucket is not defined.'
    );
  }

  const awsUser = await getAWSUser(deployment.awsUser);
  const credentials = await getAWSCredentials(awsUser);

  const s3Client = new S3Client({
    credentials,
    region: deployment.awsRegion,
  });

  const bucket = deployment.configuration.deploymentsS3Bucket;

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: 'credentials/credentials',
  });

  const credentialsUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 60 * 60,
  }); // 1 hour

  return credentialsUrl;
}
