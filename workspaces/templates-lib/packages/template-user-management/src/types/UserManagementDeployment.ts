import type { AWSDeployment } from '@goldstack/infra-aws';
import type { TerraformDeployment } from '@goldstack/utils-terraform';
import type { Deployment } from '@goldstack/infra';

import type { UserManagementDeploymentConfiguration } from './UserManagementDeploymentConfiguration';

export type {
  AWSDeployment,
  TerraformDeployment,
  Deployment,
  UserManagementDeploymentConfiguration,
};

export interface ThisDeployment extends Deployment, AWSDeployment, TerraformDeployment {
  configuration: UserManagementDeploymentConfiguration;
}

export type { ThisDeployment as UserManagementDeployment };

export default ThisDeployment;
