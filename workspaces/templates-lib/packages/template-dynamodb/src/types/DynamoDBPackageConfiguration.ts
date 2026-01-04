import type { Configuration } from '@goldstack/utils-package';

export type { Configuration };

/**
 * DynamoDB Configuration
 *
 * @title DynamoDB Configuration
 *
 */
export interface ThisPackageConfiguration extends Configuration {
  [propName: string]: any; // biome-ignore lint/suspicious/noExplicitAny: Generic configuration interface
}

export type { ThisPackageConfiguration as DynamoDBConfiguration };

export default ThisPackageConfiguration;
