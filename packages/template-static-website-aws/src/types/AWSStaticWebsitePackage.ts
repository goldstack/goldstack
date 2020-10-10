import { Package, Configuration } from '@goldstack/utils-package';

import { AWSDeployment } from '@goldstack/infra-aws';
import { TerraformDeployment } from '@goldstack/utils-terraform';
import { Deployment, DeploymentConfiguration } from '@goldstack/infra';

/**
 * The domain name of the Route 53 hosted zone that this website should be added to.
 *
 * @title Hosted Zone Domain
 * @pattern ^[^\s]*
 */
export type HostedZoneDomain = string;

/**
 * The domain name your users should use (e.g. mysite.com)
 *
 * @title Primary Website Domain
 * @pattern ^[^\s]*
 */
export type PrimaryWebsiteDomain = string;

/**
 * A domain name that users are redirected from to your Primary Website Domain (e.g. www.mysite.com)
 *
 * @title Redirect Website Domain
 * @pattern ^[^\s]*
 */
export type RedirectWebsiteDomain = string;

/**
 * Seconds resources will be cached for by default. For development sites, a good value is around 10 seconds and for production sites 60-100 seconds.
 *
 * @title Default Cache Duraction
 * @exclusiveMinimum 0
 */
export type DefaultCacheDuration = number;

export interface ThisDeploymentConfiguration extends DeploymentConfiguration {
  hostedZoneDomain: HostedZoneDomain;
  websiteDomain: PrimaryWebsiteDomain;
  websiteDomainRedirect: RedirectWebsiteDomain;
  defaultCacheDuration?: DefaultCacheDuration;
}

/**
 * Configures a static website deployment.
 *
 * @title Deployment
 */
export interface ThisDeployment
  extends Deployment,
    AWSDeployment,
    TerraformDeployment {
  configuration: ThisDeploymentConfiguration;
}

/**
 * Configures a static website hosted on AWS.
 *
 * @title AWS Static Website Configuration
 *
 */
export interface ThisPackageConfiguration extends Configuration {
  [propName: string]: any;
}

/**
 * A AWS Static Website Package.
 *
 * @title AWS Static Website Package
 */
export interface ThisPackage extends Package {
  configuration: ThisPackageConfiguration;
  deployments: ThisDeployment[];
}

export { ThisPackageConfiguration as AWSStaticWebsiteConfiguration };
export { ThisDeployment as AWSStaticWebsiteDeployment };
export { ThisDeploymentConfiguration as AWSStaticWebsiteDeploymentConfiguration };
export { ThisPackage as AWSStaticWebsitePackage };
