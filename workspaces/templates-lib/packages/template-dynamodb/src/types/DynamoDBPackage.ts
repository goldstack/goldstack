import { Package } from '@goldstack/utils-package';

import { DynamoDBConfiguration } from './DynamoDBPackageConfiguration';
import { DynamoDBDeployment } from './DynamoDBDeployment';

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
