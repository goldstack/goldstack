import type { Deployment, DeploymentConfiguration } from '@goldstack/infra';
import type { AWSDeployment } from '@goldstack/infra-aws';
import {
  LambdaConfiguration,
  type LambdaDeployment,
  type LambdaDeploymentConfiguration,
  LambdaDeployments,
  type LambdaPackage,
} from '@goldstack/template-lambda-cli';
import type { Configuration, Package } from '@goldstack/utils-package';
import type { TerraformDeployment } from '@goldstack/utils-terraform';

/**
 * The domain name that the API should be deployed to (e.g. api.mysite.com)
 *
 * @title API Domain
 * @pattern ^[^\s]*
 */
export type APIDomain = string;

/**
 * The domain name of the Route 53 hosted zone that the domain for this API should be added to.
 *
 * @title Hosted Zone Domain
 * @pattern ^[^\s]*
 */
export type HostedZoneDomain = string;

/**
 * Optional URL for an UI that should be allowed to access this server.
 *
 * @title CORS Header
 * @pattern ^[^\s]*
 */
export type CorsHeader = string;

export interface ThisDeploymentConfiguration
  extends DeploymentConfiguration,
    LambdaDeploymentConfiguration {
  apiDomain: APIDomain;
  hostedZoneDomain: HostedZoneDomain;
  cors?: CorsHeader;
}

export interface ThisDeployment
  extends Deployment,
    AWSDeployment,
    LambdaDeployment,
    TerraformDeployment {
  configuration: ThisDeploymentConfiguration;
}

/**
 * Places where the lambda should be deployed to.
 *
 * @title Deployments
 */
export type LambdaExpressDeployments = ThisDeployment[];

/**
 * Configures this lambda.
 *
 * @title Lambda Configuration
 *
 */
export type ThisPackageConfiguration = Configuration;

/**
 * A lambda deployment for an express server.
 *
 * @title Lambda Express Package
 */
export interface ThisPackage extends Package, LambdaPackage {
  configuration: ThisPackageConfiguration;
  deployments: LambdaExpressDeployments;
}

export type { ThisDeploymentConfiguration as LambdaExpressDeploymentConfiguration };
export type { ThisDeployment as LambdaExpressDeployment };
export type { ThisPackageConfiguration as LambdaExpressConfiguration };
export type { ThisPackage as LambdaExpressPackage };
