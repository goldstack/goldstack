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

export { ThisBaseDeploymentConfiguration as LambdaDeploymentConfiguration };
export { ThisBaseDeployment as LambdaDeployment };
export { ThisBasePackageConfiguration as LambdaConfiguration };
export { ThisBasePackage as LambdaPackage };
