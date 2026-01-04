import type { Configuration } from '@goldstack/utils-package';

export type { Configuration };

/**
 * S3 Configuration
 *
 * @title S3 Configuration
 *
 */
export interface ThisPackageConfiguration extends Configuration {
  [propName: string]: unknown;
}

export type { ThisPackageConfiguration as S3Configuration };

export default ThisPackageConfiguration;
