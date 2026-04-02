import type { Deployment } from '@goldstack/infra';
import type { AWSDeployment } from '@goldstack/infra-aws';
import type { TerraformDeployment } from '@goldstack/utils-terraform';

import type { BackupDeploymentConfiguration } from './BackupDeploymentConfiguration';

export type { AWSDeployment, BackupDeploymentConfiguration, Deployment, TerraformDeployment };

export interface ThisDeployment extends Deployment, AWSDeployment, TerraformDeployment {
  configuration: BackupDeploymentConfiguration;
}

export type { ThisDeployment as BackupDeployment };

export default ThisDeployment;
