import type { AWSDeployment } from '@goldstack/infra-aws';
import type { TerraformDeployment } from '@goldstack/utils-terraform';
import type { Deployment, DeploymentConfiguration } from '@goldstack/infra';
import type { SSRDeploymentConfiguration } from './SSRDeploymentConfiguration';
import type { Package, Configuration } from '@goldstack/utils-package';

export interface ThisDeploymentConfiguration
  extends SSRDeploymentConfiguration,
    DeploymentConfiguration {}

export interface ThisDeployment extends Deployment, AWSDeployment, TerraformDeployment {
  configuration: ThisDeploymentConfiguration;
}

/**
 * Places where the service should be deployed to.
 *
 * @title Deployments
 */
export type SSRDeployments = ThisDeployment[];

/**
 * Configures this service.
 *
 * @title Service Configuration
 *
 */
export type ThisPackageConfiguration = Configuration;

/**
 * A deployment for a server-side rendering package.
 *
 * @title Server-side Rendering Package
 */
export interface ThisPackage extends Package {
  configuration: ThisPackageConfiguration;
  deployments: SSRDeployments;
}

export type { ThisDeploymentConfiguration as SSRDeploymentConfiguration };
export type { ThisDeployment as SSRDeployment };
export type { ThisPackageConfiguration as SSRConfiguration };
export type { ThisPackage as SSRPackage };
