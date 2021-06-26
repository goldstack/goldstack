/**
 * Identifier for this deployment. No spaces allowed in name.
 *
 * @title Deployment Name
 * @pattern ^[^\s]*$
 */
export type DeploymentName = string;

/**
 * Specifies configuration for a specific deployment.
 *
 * @title Deployment Configuration
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DeploymentConfiguration {
  [propName: string]: any;
}

/**
 * Configures a deployment.
 *
 * @title Deployment
 */
export interface Deployment {
  name: DeploymentName;
  configuration: DeploymentConfiguration;
  [propName: string]: any;
}
