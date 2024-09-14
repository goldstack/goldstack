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
 * The Hetzner location this server should be deployed to.
 *
 * @title Location
 * @pattern ^[^\s]*
 */
export type Location = string;

/**
 * The Hetzner server name that should be used for this server.
 *
 * @title Server Name
 * @pattern ^[^\s]*
 */
export type ServerName = string;

/**
 * The Hetzner server type that should be used for this server.
 *
 * @title Server Type
 * @pattern ^[^\s]*
 */
export type ServerType = string;

/**
 * The SSH fingerprint of the SSH user that should be granted access to the server.
 *
 * @title SSH User Fingerprint
 * @pattern ^[^\s]*
 */
export type SSHUserFingerprint = string;

/**
 * The S3 Bucket that will be used to transfer the files to the server.
 *
 * @title Deployments S3 Bucket
 * @pattern ^[^\s]*
 */
export type DeploymentsS3Bucket = string;

/**
 * The name of the IAM user that the VPS server uses to access AWS resources
 *
 * @title VPS IAM User name
 * @pattern ^[^\s]*
 */
export type VPSIAMUserName = string;

/**
 * The Hetzner server deployment configuration
 */
export interface HetznerVPSDeploymentConfiguration
  extends DeploymentConfiguration {
  location: Location;
  serverType: ServerType;
  sshUserFingerprint?: SSHUserFingerprint;
  serverName: ServerName;
  deploymentsS3Bucket?: DeploymentsS3Bucket;
  vpsIAMUserName?: VPSIAMUserName;
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
