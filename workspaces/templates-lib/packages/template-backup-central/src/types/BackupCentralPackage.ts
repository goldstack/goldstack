import type { Package } from '@goldstack/utils-package';
import type { BackupCentralDeployment } from './BackupCentralDeployment';
import type { BackupCentralConfiguration } from './BackupCentralPackageConfiguration';

export type { BackupCentralConfiguration, BackupCentralDeployment };

/**
 * Places where backup central should be deployed to.
 *
 * @title Deployments
 */
export type BackupCentralDeployments = BackupCentralDeployment[];

/**
 * A backup central configuration.
 *
 * @title Backup Central Package
 */
export interface ThisPackage extends Package {
  configuration: BackupCentralConfiguration;
  deployments: BackupCentralDeployments;
}

export type { ThisPackage as BackupCentralPackage };

export default ThisPackage;
