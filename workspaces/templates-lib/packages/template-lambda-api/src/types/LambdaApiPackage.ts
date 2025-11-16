import type { Deployment, DeploymentConfiguration } from '@goldstack/infra';
import type { AWSDeployment } from '@goldstack/infra-aws';
import type { LambdaApiDeploymentConfiguration } from '@goldstack/utils-aws-lambda';
import type { Configuration, Package } from '@goldstack/utils-package';
import type { TerraformDeployment } from '@goldstack/utils-terraform';

export interface ThisDeploymentConfiguration
  extends LambdaApiDeploymentConfiguration,
    DeploymentConfiguration {}

export interface ThisDeployment extends Deployment, AWSDeployment, TerraformDeployment {
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

export type { ThisDeploymentConfiguration as LambdaApiDeploymentConfiguration };
export type { ThisDeployment as LambdaApiDeployment };
export type { ThisPackageConfiguration as LambdaApiConfiguration };
export type { ThisPackage as LambdaApiPackage };
