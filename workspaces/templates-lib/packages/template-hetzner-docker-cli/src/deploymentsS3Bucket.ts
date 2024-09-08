import {
  HetznerDockerDeployment,
  HetznerDockerPackage,
} from '@goldstack/template-hetzner-docker';
import { PackageConfig } from '@goldstack/utils-package-config';
import crypto from 'crypto';

import {
  BucketAlreadyOwnedByYou,
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';
import { getAWSUser, getAWSCredentials } from '@goldstack/infra-aws';

export interface DeploymentsS3BucketParams {
  deployment: string;
  packageConfig: PackageConfig<HetznerDockerPackage, HetznerDockerDeployment>;
}

export async function assertDeploymentsS3Bucket(
  params: DeploymentsS3BucketParams
) {
  const deployment = params.packageConfig.getDeployment(params.deployment);

  const awsUser = await getAWSUser(deployment.awsUser);

  const credentials = await getAWSCredentials(awsUser);
  const s3Client = new S3Client({
    credentials: credentials,
    region: deployment.awsRegion,
  });

  if (!deployment.configuration.deploymentsS3Bucket) {
    const projectHash = crypto.randomBytes(20).toString('hex');
    deployment.configuration.deploymentsS3Bucket = `goldstack-deployments-${deployment.name}-${deployment.configuration.serverName}-${projectHash}`;
  }

  await assertS3Bucket({
    s3: s3Client,
    bucketName: deployment.configuration.deploymentsS3Bucket,
  });
}

export interface DeleteDeploymentsS3BucketParams {
  deployment: string;
  packageConfig: PackageConfig<HetznerDockerPackage, HetznerDockerDeployment>;
}

export async function deleteDeploymentsS3Bucket(
  params: DeleteDeploymentsS3BucketParams
) {
  const deployment = params.packageConfig.getDeployment(params.deployment);

  const awsUser = await getAWSUser(deployment.awsUser);

  const credentials = await getAWSCredentials(awsUser);
  const s3Client = new S3Client({
    credentials: credentials,
    region: deployment.awsRegion,
  });
  if (!deployment.configuration.deploymentsS3Bucket) {
    console.warn(
      'No deployments S3 bucket was destroyed since S3 bucket name not specified. This could be due to the S3 bucket not having been created yet.'
    );
    return;
  }
  await deleteS3Bucket({
    s3: s3Client,
    bucketName: deployment.configuration.deploymentsS3Bucket,
  });
}

const assertS3Bucket = async (params: {
  s3: S3Client;
  bucketName: string;
}): Promise<void> => {
  const bucketParams = {
    Bucket: params.bucketName,
  };
  try {
    console.log(
      'Accessing/creating bucket for Terraform state',
      bucketParams.Bucket
    );

    await params.s3.send(new CreateBucketCommand(bucketParams));
  } catch (e) {
    // if bucket already exists, ignore error
    if (!(e instanceof BucketAlreadyOwnedByYou)) {
      console.error(
        'Cannot create bucket ',
        params.bucketName,
        ' error code',
        e.code
      );
      throw new Error('Cannot create S3 state bucket: ' + e.message);
    }
  }
};

const deleteAllObjectsFromBucket = async (
  s3: S3Client,
  bucketName: string
): Promise<void> => {
  let continuationToken: string | undefined = undefined;
  do {
    // List objects in the bucket
    const listResponse = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
      })
    );

    // Check if there are any objects to delete
    if (listResponse.Contents && listResponse.Contents.length > 0) {
      // Delete listed objects
      const deleteParams = {
        Bucket: bucketName,
        Delete: {
          Objects: listResponse.Contents.map((object) => ({ Key: object.Key })),
        },
      };
      await s3.send(new DeleteObjectsCommand(deleteParams));
    }

    // Check if more objects are to be listed (pagination)
    continuationToken = listResponse.NextContinuationToken;
  } while (continuationToken);
};

const deleteS3Bucket = async (params: {
  s3: S3Client;
  bucketName: string;
}): Promise<void> => {
  try {
    // First, delete all objects from the bucket
    await deleteAllObjectsFromBucket(params.s3, params.bucketName);

    // Then, delete the empty bucket
    await params.s3.send(
      new DeleteBucketCommand({ Bucket: params.bucketName })
    );
  } catch (e) {
    throw e; // Rethrow the error to handle it in the calling code if necessary
  }
};
