import { Package } from '@goldstack/utils-package';

import { S3Configuration } from './S3PackageConfiguration';
import { S3Deployment } from './S3Deployment';

export { S3Configuration, S3Deployment };

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

export { ThisPackage as S3Package };

export default ThisPackage;
