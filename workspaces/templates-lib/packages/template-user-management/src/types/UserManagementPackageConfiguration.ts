import type { Configuration } from '@goldstack/utils-package';

export type { Configuration };

/**
 * User Management Configuration
 *
 * @title User Management Configuration
 *
 */
export interface ThisPackageConfiguration extends Configuration {
  [propName: string]: any;
}

export type { ThisPackageConfiguration as UserManagementConfiguration };

export default ThisPackageConfiguration;
