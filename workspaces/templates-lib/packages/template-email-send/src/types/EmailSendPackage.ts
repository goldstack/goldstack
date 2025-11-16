import type { Deployment } from '@goldstack/infra';
import { DeploymentConfiguration } from '@goldstack/infra';
import type { AWSDeployment } from '@goldstack/infra-aws';
import type { Package } from '@goldstack/utils-package';
import type { TerraformDeployment } from '@goldstack/utils-terraform';
export { DeploymentConfiguration };

import { Configuration } from '@goldstack/utils-package';
export { Configuration };

/**
 * The domain that will be used for email sender FROM addresses.
 *
 * @title Domain
 * @pattern ^[^\s]*
 */
export type EmailDomain = string;

/**
 * The domain name of the Route 53 hosted zone that the specific domain will be added to. This is often the same as the domain used for the FROM address.
 *
 * @title Hosted Zone Domain
 * @pattern ^[^\s]*
 */
export type HostedZoneDomain = string;

export interface EmailSendDeploymentConfiguration extends DeploymentConfiguration {
  domain: EmailDomain;
  hostedZoneDomain: HostedZoneDomain;
}

/**
 * Configures a deployment target for the email infrastrucutre.
 *
 * @Title Deployment
 *
 */
export interface EmailSendDeployment extends Deployment, AWSDeployment, TerraformDeployment {
  configuration: EmailSendDeploymentConfiguration;
}

/**
 * Places where email send should be configured.
 *
 * @title Deployments
 */
export type EmailSendDeployments = EmailSendDeployment[];

/**
 * Email send package configuration
 *
 * @title Email Send Configuration
 *
 */
export interface EmailSendPackageConfiguration extends Configuration {
  [propName: string]: any;
}

/**
 * A package for enabling email sends through AWS SES.
 *
 * @title Email Send Package
 */
export interface EmailSendPackage extends Package {
  configuration: EmailSendPackageConfiguration;
  deployments: EmailSendDeployments;
}

export default EmailSendPackage;
