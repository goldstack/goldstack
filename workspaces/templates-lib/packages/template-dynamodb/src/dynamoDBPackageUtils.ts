/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import type { EmbeddedPackageConfig } from '@goldstack/utils-package-config-embedded';
import assert from 'assert';
import type DynamoDBPackage from './types/DynamoDBPackage';
import type { DynamoDBDeployment } from './types/DynamoDBPackage';

export const getTableName = async (
  packageConfig: EmbeddedPackageConfig<DynamoDBPackage, DynamoDBDeployment>,
  deploymentName?: string,
): Promise<string> => {
  deploymentName = getDeploymentName(deploymentName);
  if (deploymentName === 'local') {
    // For local development, use the table name from the first deployment
    const deployments = packageConfig.getConfig().deployments;
    if (deployments.length > 0) {
      return deployments[0].configuration.tableName;
    }
    // Fallback to package name if no deployments
    return `${packageConfig.getConfig().name}`;
  }
  const deployment = packageConfig.getDeployment(deploymentName);
  return deployment.configuration.tableName;
};

export const getDeploymentName = (deploymentName?: string): string => {
  if (!deploymentName) {
    assert(
      process.env.GOLDSTACK_DEPLOYMENT,
      'Cannot connect to DynamoDB table. Either specify a deploymentName or ensure environment variable GOLDSTACK_DEPLOYMENT is defined.',
    );
    return process.env.GOLDSTACK_DEPLOYMENT;
  }
  return deploymentName;
};
