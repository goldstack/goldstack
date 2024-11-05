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

export interface ThisDeploymentConfiguration
  extends DeploymentConfiguration,
    DeploymentConfiguration {
  sqsQueueName?: SQSQueueName;
}

export interface ThisDeployment
  extends Deployment,
    AWSDeployment,
    Deployment,
    TerraformDeployment {
  configuration: ThisDeploymentConfiguration;
}

/**
 * Places where the queue should be deployed to
 *
 * @title Deployments
 */
export type SqsDeployments = ThisDeployment[];

/**
 * Configures this queue.
 *
 * @title Configuration
 *
 */
export type ThisPackageConfiguration = Configuration;

/**
 * A queue deployment.
 *
 * @title SQS Package
 */
export interface ThisPackage extends Package, Package {
  configuration: ThisPackageConfiguration;
  deployments: SqsDeployments;
}

export { ThisDeploymentConfiguration as SqsDeploymentConfiguration };
export { ThisDeployment as SqsDeployment };
export { ThisPackageConfiguration as SqsConfiguration };
export { ThisPackage as SqsPackage };
