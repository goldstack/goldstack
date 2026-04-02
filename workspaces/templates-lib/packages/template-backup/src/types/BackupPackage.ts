import type { Package } from '@goldstack/utils-package';
import type { BackupDeployment } from './BackupDeployment';
import type { BackupConfiguration } from './BackupPackageConfiguration';

export type { BackupConfiguration, BackupDeployment };

/**
 * Places where backup should be deployed to.
 *
 * @title Deployments
 */
export type BackupDeployments = BackupDeployment[];

/**
 * A backup configuration.
 *
 * @title Backup Package
 */
export interface ThisPackage extends Package {
  configuration: BackupConfiguration;
  deployments: BackupDeployments;
}

export type { ThisPackage as BackupPackage };

export default ThisPackage;
