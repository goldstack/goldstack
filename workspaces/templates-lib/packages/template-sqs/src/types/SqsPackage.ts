import type { Deployment } from '@goldstack/infra';
import { DeploymentConfiguration } from '@goldstack/infra';
import type { AWSDeployment } from '@goldstack/infra-aws';
import type { Package } from '@goldstack/utils-package';
import type { TerraformDeployment } from '@goldstack/utils-terraform';
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

export type { ThisSqsDeploymentConfiguration as SqsDeploymentConfiguration };
export type { ThisSqsDeployment as SqsDeployment };
export type { ThisSqsPackageConfiguration as SqsConfiguration };
export type { ThisSqsPackage as SqsPackage };
