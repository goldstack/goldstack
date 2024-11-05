import { Package } from '@goldstack/utils-package';

import { AWSDeployment } from '@goldstack/infra-aws';
import { TerraformDeployment } from '@goldstack/utils-terraform';
import { Deployment } from '@goldstack/infra';
import { DeploymentConfiguration } from '@goldstack/infra';
export { DeploymentConfiguration };
import { Configuration } from '@goldstack/utils-package';
export { Configuration };

/**
 * Name of the SQS queue that is used to trigger the lambda. SQS queue should not exist and will be created when the name is provided.
 *
 * @title SQS Queue Name
 */
export type SQSQueueName = string;

export interface ThisSqsDeploymentConfiguration
  extends DeploymentConfiguration,
    DeploymentConfiguration {
  sqsQueueName?: SQSQueueName;
}

export interface ThisSqsDeployment
  extends Deployment,
    AWSDeployment,
    Deployment,
    TerraformDeployment {
  configuration: ThisSqsDeploymentConfiguration;
}

/**
 * Places where the queue should be deployed to
 *
 * @title Deployments
 */
export type SqsDeployments = ThisSqsDeployment[];

/**
 * Configures this queue.
 *
 * @title Configuration
 *
 */
export type ThisSqsPackageConfiguration = Configuration;

/**
 * A queue deployment.
 *
 * @title SQS Package
 */
export interface ThisSqsPackage extends Package, Package {
  configuration: ThisSqsPackageConfiguration;
  deployments: SqsDeployments;
}

export { ThisSqsDeploymentConfiguration as SqsDeploymentConfiguration };
export { ThisSqsDeployment as SqsDeployment };
export { ThisSqsPackageConfiguration as SqsConfiguration };
export { ThisSqsPackage as SqsPackage };
