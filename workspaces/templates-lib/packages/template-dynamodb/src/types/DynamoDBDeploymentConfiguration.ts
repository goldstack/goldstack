import type { DeploymentConfiguration } from '@goldstack/infra';

export type { DeploymentConfiguration };

/**
 * The name of the DynamoDB table. No spaces, numbers or special characters other than '-', '.' and '_' allowed.
 *
 * See https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html
 *
 * @title DynamoDB table name
 * @pattern ^[A-Za-z0-9-\._]*$
 */
type TableName = string;

export interface ThisDeploymentConfiguration extends DeploymentConfiguration {
  tableName: TableName;
}

export type { ThisDeploymentConfiguration as DynamoDBDeploymentConfiguration };
