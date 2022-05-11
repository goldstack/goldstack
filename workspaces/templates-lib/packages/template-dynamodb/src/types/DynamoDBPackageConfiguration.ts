import { Configuration } from '@goldstack/utils-package';

export type { Configuration };

/**
 * DynamoDB Configuration
 *
 * @title DynamoDB Configuration
 *
 */
export interface ThisPackageConfiguration extends Configuration {
  [propName: string]: any;
}

export type { ThisPackageConfiguration as DynamoDBConfiguration };

export default ThisPackageConfiguration;
