import { AWSDeployment } from '@goldstack/infra-aws';
import { TerraformDeployment } from '@goldstack/utils-terraform';
import { Deployment, DeploymentConfiguration } from '@goldstack/infra';
import { Package, Configuration } from '@goldstack/utils-package';
import { LambdaApiDeploymentConfiguration } from '@goldstack/utils-aws-lambda';

export interface ThisDeploymentConfiguration
  extends LambdaApiDeploymentConfiguration,
    DeploymentConfiguration {}

export interface ThisDeployment
  extends Deployment,
    AWSDeployment,
    TerraformDeployment {
  configuration: ThisDeploymentConfiguration;
}

/**
 * Places where the lambda should be deployed to.
 *
 * @title Deployments
 */
export type LambdaApiDeployments = ThisDeployment[];

/**
 * Configures this lambda.
 *
 * @title Lambda Configuration
 *
 */
export type ThisPackageConfiguration = Configuration;

/**
 * A deployment for a lambda API.
 *
 * @title Lambda API Package
 */
export interface ThisPackage extends Package {
  configuration: ThisPackageConfiguration;
  deployments: LambdaApiDeployments;
}

export { ThisDeploymentConfiguration as LambdaApiDeploymentConfiguration };
export { ThisDeployment as LambdaApiDeployment };
export { ThisPackageConfiguration as LambdaApiConfiguration };
export { ThisPackage as LambdaApiPackage };
