import { Package } from '@goldstack/utils-package';

import { AWSDeployment } from '@goldstack/infra-aws';
import { HetznerDeployment } from '@goldstack/infra-hetzner';
import { TerraformDeployment } from '@goldstack/utils-terraform';
import { Deployment } from '@goldstack/infra';
import { DeploymentConfiguration } from '@goldstack/infra';
export { DeploymentConfiguration };
import { Configuration } from '@goldstack/utils-package';
export { Configuration };

/**
 * The Hetzner location this server should be deployed to. See <a href="https://docs.hetzner.com/cloud/general/locations/">Hetzner Locations</a>.
 *
 * @title Location
 * @pattern ^[^\s]*
 */
export type Location =
  | 'hil'
  | 'fsn1'
  | 'nbg1'
  | 'hel1'
  | 'ash'
  | 'sin'
  | string;

/**
 * The Hetzner server name that should be used for this server.
 *
 * @title Server Name
 * @pattern ^[^\s]*
 */
export type ServerName = string;

/**
 * The Hetzner server type that should be used for this server. See <a href="https://docs.hetzner.com/cloud/servers/overview">Hetzner Servers</a>.
 *
 * @title Server Type
 * @pattern ^[^\s]*
 */
export type ServerType =
  | 'cx22'
  | 'cx32'
  | 'cx42'
  | 'cx52'
  | 'cpx11'
  | 'cpx21'
  | 'cpx31'
  | 'cpx41'
  | 'cpx51'
  | 'cax11'
  | 'cax21'
  | 'cax31'
  | 'cax41'
  | 'ccx13'
  | 'ccx23'
  | 'ccx33'
  | 'ccx43'
  | 'ccx53'
  | 'ccx63'
  | string;

/**
 * The SSH fingerprint of the SSH user that should be granted access to the server.
 *
 * @title SSH User Fingerprint
 * @pattern ^[^\s]*
 */
export type SSHUserFingerprint = string;

/**
 * Only allow SSH access to the server from the specified IP.
 *
 * @title Only allow SSH access from IP
 */
export type OnlyAllowSSHAccessFromIP = string;

/**
 * Environment variable name.
 *
 * @title Environment Variable Name
 * @pattern ^[^\s]*
 */
export type EnvVarName = string;

/**
 * Environment variable value.
 *
 * @title Environment Variable Value
 */
export type EnvVarValue = string;

/**
 * Environment variable configuration.
 *
 * @title Environment Variable
 */
export interface EnvironmentVariable {
  name: EnvVarName;
  value: EnvVarValue;
}

/**
 * Environment variables configuration.
 *
 * @title Environment Variables
 */
export type EnvironmentVariables = EnvironmentVariable[];

/**
 * The Hetzner server deployment configuration
 */
export interface HetznerVPSDeploymentConfiguration
  extends DeploymentConfiguration {
  location: Location;
  serverType: ServerType;
  sshUserFingerprint?: SSHUserFingerprint;
  serverName: ServerName;
  onlyAllowSshAccessFromIp?: OnlyAllowSSHAccessFromIP;
  environmentVariables?: EnvironmentVariables;
}

/**
 * Configures a deployment target for the Hetzner server.
 *
 * @Title Deployment
 *
 */
export interface HetznerVPSDeployment
  extends Deployment,
    AWSDeployment,
    HetznerDeployment,
    TerraformDeployment {
  configuration: HetznerVPSDeploymentConfiguration;
}

/**
 * Configurations for Hetzner VPS deployments.
 *
 * @title Deployments
 */
export type HetznerVPSDeployments = HetznerVPSDeployment[];

/**
 * Hetzner VPS package configuration
 *
 * @title Hetzner VPS Configuration
 *
 */
export interface HetznerVPSPackageConfiguration extends Configuration {
  [propName: string]: any;
}

/**
 * A package for provisioning Hetzner servers with Docker.
 *
 * @title Email Send Package
 */
export interface HetznerVPSPackage extends Package {
  configuration: HetznerVPSPackageConfiguration;
  deployments: HetznerVPSDeployments;
}

export default HetznerVPSPackage;
