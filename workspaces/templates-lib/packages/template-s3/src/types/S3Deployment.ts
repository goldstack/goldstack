import { AWSDeployment } from '@goldstack/infra-aws';
import { TerraformDeployment } from '@goldstack/utils-terraform';
import { Deployment } from '@goldstack/infra';

import { S3DeploymentConfiguration } from './S3DeploymentConfiguration';

export type {
  AWSDeployment,
  TerraformDeployment,
  Deployment,
  S3DeploymentConfiguration,
};

export interface ThisDeployment
  extends Deployment,
    AWSDeployment,
    TerraformDeployment {
  configuration: S3DeploymentConfiguration;
}

export type { ThisDeployment as S3Deployment };

export default ThisDeployment;
