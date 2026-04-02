import type { Deployment } from '@goldstack/infra';
import type { AWSDeployment } from '@goldstack/infra-aws';
import type { TerraformDeployment } from '@goldstack/utils-terraform';

import type { BackupCentralDeploymentConfiguration } from './BackupCentralDeploymentConfiguration';

export type {
  AWSDeployment,
  BackupCentralDeploymentConfiguration,
  Deployment,
  TerraformDeployment,
};

export interface ThisDeployment extends Deployment, AWSDeployment, TerraformDeployment {
  configuration: BackupCentralDeploymentConfiguration;
}

export type { ThisDeployment as BackupCentralDeployment };

export default ThisDeployment;
