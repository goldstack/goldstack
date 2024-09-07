import { Deployment } from '@goldstack/infra';

/**
 * Name of the Hetzner user that is used to perform the deployment.
 *
 * @title Hetzner User Name
 */
export type HetznerUserName = string;

export interface HetznerDeployment extends Deployment {
  hetznerUser: HetznerUserName;
}
