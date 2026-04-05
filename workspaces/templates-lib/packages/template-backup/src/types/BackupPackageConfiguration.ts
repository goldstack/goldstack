import type { Configuration } from '@goldstack/utils-package';

export type { Configuration };

/**
 * Backup Configuration
 *
 * @title Backup Configuration
 *
 */
export interface ThisPackageConfiguration extends Configuration {
  [propName: string]: any;
}

export type { ThisPackageConfiguration as BackupConfiguration };

export default ThisPackageConfiguration;
