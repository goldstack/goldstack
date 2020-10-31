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
 * @pattern ^https[^\s]*
 */
export type CorsHeader = string;

export interface ThisDeploymentConfiguration extends DeploymentConfiguration {
  lambdaName: LambdaName;
  apiDomain: APIDomain;
  hostedZoneDomain: HostedZoneDomain;
  cors: CorsHeader;
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
export interface ThisPackage extends Package {
  configuration: ThisPackageConfiguration;
  deployments: LambdaExpressDeployments;
}

export { ThisDeploymentConfiguration as LambdaExpressDeploymentConfiguration };
export { ThisDeployment as LambdaExpressDeployment };
export { ThisPackageConfiguration as LambdaExpressConfiguration };
export { ThisPackage as LambdaExpressPackage };
