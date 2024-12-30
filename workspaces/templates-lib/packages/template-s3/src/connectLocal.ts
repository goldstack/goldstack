import { S3Client } from '@aws-sdk/client-s3';
import { excludeInBundle } from '@goldstack/utils-esbuild';
import { warn } from '@goldstack/utils-log';
import { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import { S3Deployment, S3Package } from './templateS3';
import { AWSDeploymentRegion, getAWSUser } from '@goldstack/infra-aws';

let s3MockUsed = false;

/**
 * Type for the createS3Client function from mock-aws-s3-v3
 */
export type CreateS3ClientSignature = (options: {
  localDirectory: string;
  s3Client?: S3Client;
  bucket: string;
}) => S3Client;

/**
 * Gets the package configuration and deployment for S3 operations
 */
const getPackageConfigAndDeployment = (
  goldstackConfig: any,
  packageSchema: any,
  deploymentName?: string
): {
  packageConfig: EmbeddedPackageConfig<S3Package, S3Deployment>;
  deployment: S3Deployment;
} => {
  const packageConfig = new EmbeddedPackageConfig<S3Package, S3Deployment>({
    goldstackJson: goldstackConfig,
    packageSchema,
  });

  deploymentName = deploymentName || process.env.GOLDSTACK_DEPLOYMENT;
  if (!deploymentName) {
    throw new Error('GOLDSTACK_DEPLOYMENT environment variable is not set.');
  }

  if (deploymentName === 'local') {
    return {
      packageConfig,
      deployment: {
        name: 'local',
        awsRegion: 'us-east-1' as AWSDeploymentRegion,
        awsUser: process.env.AWS_USER || 'local',
        configuration: {
          bucketName: goldstackConfig.name,
        },
      } as S3Deployment,
    };
  }

  const deployment = packageConfig.getDeployment(deploymentName);
  if (!deployment) {
    throw new Error(`Cannot find deployment ${deploymentName}.`);
  }

  return { packageConfig, deployment };
};

/**
 * Gets a mocked S3 client for local development
 */
export const getMockedS3 = (
  goldstackConfig: any,
  bucket?: string
): S3Client => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const createS3Client: CreateS3ClientSignature = require(excludeInBundle(
    'mock-aws-s3-v3'
  )).createS3Client;

  const client = createS3Client({
    localDirectory: 'goldstackLocal/s3',
    bucket: bucket || getLocalBucketName(goldstackConfig),
  });

  (client as any)._goldstackIsMocked = true;
  s3MockUsed = true;
  return client;
};

/**
 * Gets the local bucket name for a given configuration
 */
export function getLocalBucketName(goldstackConfig: any): string {
  return `local-${goldstackConfig.name}`;
}

/**
 * Gets the local bucket URL for a given configuration
 */
export function getLocalBucketUrl(goldstackConfig: any): string {
  return `http://localhost:4566/${getLocalBucketName(goldstackConfig)}`;
}

/**
 * Connects to S3, using a mocked client for local deployment or a real S3 client for other environments
 */
export async function connect(
  goldstackConfig: any,
  packageSchema: any,
  bucket?: string
): Promise<S3Client> {
  const { deployment } = getPackageConfigAndDeployment(
    goldstackConfig,
    packageSchema
  );

  if (deployment.name === 'local') {
    warn(
      `Initializing mocked S3 for ${goldstackConfig.name}. Consider using getMockedS3() directly if you need bucket-specific configuration.`
    );
    return getMockedS3(goldstackConfig, bucket);
  }

  const awsUser = process.env.AWS_ACCESS_KEY_ID
    ? undefined
    : await getAWSUser(deployment.awsUser);

  return new S3Client({
    credentials: awsUser,
    region: deployment.awsRegion,
  });
}

export const isMocked = (client: S3Client): boolean => {
  return (client as any)._goldstackIsMocked === true;
};

export function resetMocksIfRequired(
  deploymentName: string | undefined,
  goldstackConfig: any
) {
  if (s3MockUsed) {
    warn(
      'Initialising a real S3 bucket after a mocked one had been created. All mocks are reset.',
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
