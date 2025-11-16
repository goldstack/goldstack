import type { Package } from '@goldstack/utils-package';
import type { S3Deployment } from './S3Deployment';
import type { S3Configuration } from './S3PackageConfiguration';

export type { S3Configuration, S3Deployment };

/**
 * Places where the S3 bucket should be deployed to.
 *
 * @title Deployments
 */
export type S3Deployments = S3Deployment[];

/**
 * An S3 bucket.
 *
 * @title S3 Package
 */
export interface ThisPackage extends Package {
  configuration: S3Configuration;
  deployments: S3Deployments;
}

export type { ThisPackage as S3Package };

export default ThisPackage;
