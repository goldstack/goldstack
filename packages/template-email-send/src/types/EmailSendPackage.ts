import { Package } from '@goldstack/utils-package';

import { AWSDeployment } from '@goldstack/infra-aws';
import { TerraformDeployment } from '@goldstack/utils-terraform';
import { Deployment } from '@goldstack/infra';
import { DeploymentConfiguration } from '@goldstack/infra';
export { DeploymentConfiguration };
import { Configuration } from '@goldstack/utils-package';
export { Configuration };

export interface EmailSendDeploymentConfiguration
  extends DeploymentConfiguration {
  domain: string;
  hostedZoneDomain: string;
}

export interface EmailSendDeployment
  extends Deployment,
    AWSDeployment,
    TerraformDeployment {
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
