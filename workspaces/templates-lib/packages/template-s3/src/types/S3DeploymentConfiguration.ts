import type { DeploymentConfiguration } from '@goldstack/infra';

export type { DeploymentConfiguration };

/**
 * The name of the bucket. No spaces, numbers or special characters other than '-' allowed.
 *
 * @title Bucket Name
 * @pattern ^[A-Za-z0-9-]*$
 */
type BucketName = string;

export interface ThisDeploymentConfiguration extends DeploymentConfiguration {
  bucketName: BucketName;
}

export type { ThisDeploymentConfiguration as S3DeploymentConfiguration };
