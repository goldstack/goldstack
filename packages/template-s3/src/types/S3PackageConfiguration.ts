import { Configuration } from '@goldstack/utils-package';

export { Configuration };

/**
 * S3 Configuration
 *
 * @title S3 Configuration
 *
 */
export interface ThisPackageConfiguration extends Configuration {
  [propName: string]: any;
}

export { ThisPackageConfiguration as S3Configuration };

export default ThisPackageConfiguration;
