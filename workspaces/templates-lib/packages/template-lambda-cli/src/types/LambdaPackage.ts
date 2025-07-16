import type { AWSDeployment } from '@goldstack/infra-aws';
import type { TerraformDeployment } from '@goldstack/utils-terraform';
import type { Deployment, DeploymentConfiguration } from '@goldstack/infra';
import type { Package, Configuration } from '@goldstack/utils-package';

/**
 * The name of the lambda.
 *
 * @title Lambda Name
 * @pattern ^[A-Za-z0-9-_]*$
 */
type LambdaName = string;

export interface ThisBaseDeploymentConfiguration
  extends DeploymentConfiguration {
  lambdaName: LambdaName;
}

export interface ThisBaseDeployment
  extends Deployment,
    AWSDeployment,
    TerraformDeployment {
  configuration: ThisBaseDeploymentConfiguration;
}

/**
 * Places where the lambda should be deployed to.
 *
 * @title Deployments
 */
export type LambdaDeployments = ThisBaseDeployment[];

/**
 * Configures this lambda.
 *
 * @title Lambda Configuration
 *
 */
export type ThisBasePackageConfiguration = Configuration;

/**
 * A lambda deployment.
 *
 * @title Lambda Package
 */
export interface ThisBasePackage extends Package {
  configuration: ThisBasePackageConfiguration;
  deployments: LambdaDeployments;
}

export type { ThisBaseDeploymentConfiguration as LambdaDeploymentConfiguration };
export type { ThisBaseDeployment as LambdaDeployment };
export type { ThisBasePackageConfiguration as LambdaConfiguration };
export type { ThisBasePackage as LambdaPackage };
