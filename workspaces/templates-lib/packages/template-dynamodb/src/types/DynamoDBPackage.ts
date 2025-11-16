import type { Package } from '@goldstack/utils-package';
import type { DynamoDBDeployment } from './DynamoDBDeployment';
import type { DynamoDBConfiguration } from './DynamoDBPackageConfiguration';

export type { DynamoDBConfiguration, DynamoDBDeployment };

/**
 * Places where the DynamoDB table should be deployed to.
 *
 * @title Deployments
 */
export type DynamoDBDeployments = DynamoDBDeployment[];

/**
 * A DynamoDB table.
 *
 * @title DynamoDB Package
 */
export interface ThisPackage extends Package {
  configuration: DynamoDBConfiguration;
  deployments: DynamoDBDeployments;
}

export type { ThisPackage as DynamoDBPackage };

export default ThisPackage;
