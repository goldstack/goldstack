/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { PackageConfig } from '@goldstack/utils-package-config';
import assert from 'assert';
import DynamoDBPackage, { DynamoDBDeployment } from './types/DynamoDBPackage';

export const getTableName = async (
  goldstackConfig: DynamoDBPackage,
  packageConfig: PackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName?: string
): Promise<string> => {
  deploymentName = getDeploymentName(deploymentName);
  if (deploymentName === 'local') {
    return `local-${goldstackConfig.name}`;
  }
  const deployment = packageConfig.getDeployment(deploymentName);
  return deployment.configuration.tableName;
};

export const getDeploymentName = (deploymentName?: string): string => {
  if (!deploymentName) {
    assert(
      process.env.GOLDSTACK_DEPLOYMENT,
      'Cannot connect to DynamoDB table. Either specify a deploymentName or ensure environment variable GOLDSTACK_DEPLOYMENT is defined.'
    );
    return process.env.GOLDSTACK_DEPLOYMENT;
  }
  return deploymentName;
};
