import { AWSDeployment } from '@goldstack/infra-aws';
import { TerraformDeployment } from '@goldstack/utils-terraform';
import { Deployment, DeploymentConfiguration } from '@goldstack/infra';
import { Package, Configuration } from '@goldstack/utils-package';

/**
 * The name of the lambda.
 *
 * @title Lambda Name
 * @pattern ^[A-Za-z0-9-_]*$
 */
type LambdaName = string;

export interface ThisDeploymentConfiguration extends DeploymentConfiguration {
  lambdaName: LambdaName;
}

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
export type LambdaDeployments = ThisDeployment[];

/**
 * Configures this lambda.
 *
 * @title Lambda Configuration
 *
 */
export type ThisPackageConfiguration = Configuration;

/**
 * A lambda deployment.
 *
 * @title Lambda Package
 */
export interface ThisPackage extends Package {
  configuration: ThisPackageConfiguration;
  deployments: LambdaDeployments;
}

export { ThisDeploymentConfiguration as LambdaDeploymentConfiguration };
export { ThisDeployment as LambdaDeployment };
export { ThisPackageConfiguration as LambdaConfiguration };
export { ThisPackage as LambdaPackage };
