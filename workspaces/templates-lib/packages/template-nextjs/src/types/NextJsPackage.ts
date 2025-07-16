import type {
  AWSStaticWebsiteDeployment,
  AWSStaticWebsitePackage,
  AWSStaticWebsiteConfiguration,
  AWSStaticWebsiteDeploymentConfiguration,
} from '@goldstack/template-static-website-aws';

/**
 * Define the name and value for the environment variable.
 *
 * @title NextJs Environment Variable
 */
export interface NextjsEnvironmentVariable {
  /**
   * Environment variable name
   *
   * @title Name
   */
  name: string;
  /**
   * Environment variable value
   *
   * @title Value
   */
  value: string;
}

export interface NextjsDeploymentConfiguration
  extends AWSStaticWebsiteDeploymentConfiguration {
  /**
   * Define environment variables for the NextJs application.
   *
   * @title Environment Variables
   */
  environmentVariables?: NextjsEnvironmentVariable[];
}

/**
 * Configure NextJs deployment
 *
 * @title NextJs Deployment
 */
export interface NextjsDeployment extends AWSStaticWebsiteDeployment {
  configuration: NextjsDeploymentConfiguration;
}

/**
 * Configure NextJS application
 *
 * @title NextJs Configuration
 *
 */
export type NextjsPackageConfiguration = AWSStaticWebsiteConfiguration;

/**
 * A NextJs application
 *
 * @title NextJs Package
 */
export interface NextjsPackage extends AWSStaticWebsitePackage {
  configuration: NextjsPackageConfiguration;
  deployments: NextjsDeployment[];
}
