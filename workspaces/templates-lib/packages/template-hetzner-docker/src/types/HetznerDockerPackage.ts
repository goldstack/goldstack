import { Package } from '@goldstack/utils-package';

import { AWSDeployment } from '@goldstack/infra-aws';
import { TerraformDeployment } from '@goldstack/utils-terraform';
import { Deployment } from '@goldstack/infra';
import { DeploymentConfiguration } from '@goldstack/infra';
export { DeploymentConfiguration };
import { Configuration } from '@goldstack/utils-package';
export { Configuration };

/**
 * The Hetzner location this server should be deployed to.
 *
 * @title Location
 * @pattern ^[^\s]*
 */
export type Location = string;

/**
 * The Hetzner server type that should be used for this server.
 *
 * @title Server Type
 * @pattern ^[^\s]*
 */
export type ServerType = string;

/**
 * The Hetzner server deployment configuration
 */
export interface HetznerDockerDeploymentConfiguration
  extends DeploymentConfiguration {
  location: Location;
  serverType: ServerType;
}

/**
 * Configures a deployment target for the Hetzner server.
 *
 * @Title Deployment
 *
 */
export interface HetznerDockerDeployment
  extends Deployment,
    AWSDeployment,
    TerraformDeployment {
  configuration: HetznerDockerDeploymentConfiguration;
}

/**
 * Configurations for Hetzner docker deployments.
 *
 * @title Deployments
 */
export type HetznerDockerDeployments = HetznerDockerDeployment[];

/**
 * Hetzner Docker package configuration
 *
 * @title Hetzner Docker Configuration
 *
 */
export interface HetznerDockerPackageConfiguration extends Configuration {
  [propName: string]: any;
}

/**
 * A package for provisioning Hetzner servers with Docker.
 *
 * @title Email Send Package
 */
export interface HetznerDockerPackage extends Package {
  configuration: HetznerDockerPackageConfiguration;
  deployments: HetznerDockerDeployments;
}

export default HetznerDockerPackage;
