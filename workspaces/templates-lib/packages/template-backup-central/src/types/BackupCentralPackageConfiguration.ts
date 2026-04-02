import type { Configuration } from '@goldstack/utils-package';

export type { Configuration };

/**
 * Backup Central Configuration
 *
 * @title Backup Central Configuration
 *
 */
export interface ThisPackageConfiguration extends Configuration {
  [propName: string]: any;
}

export type { ThisPackageConfiguration as BackupCentralConfiguration };

export default ThisPackageConfiguration;
