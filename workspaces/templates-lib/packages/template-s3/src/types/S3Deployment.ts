import type { AWSDeployment } from '@goldstack/infra-aws';
import type { TerraformDeployment } from '@goldstack/utils-terraform';
import type { Deployment } from '@goldstack/infra';

import type { S3DeploymentConfiguration } from './S3DeploymentConfiguration';

export type { AWSDeployment, TerraformDeployment, Deployment, S3DeploymentConfiguration };

export interface ThisDeployment extends Deployment, AWSDeployment, TerraformDeployment {
  configuration: S3DeploymentConfiguration;
}

export type { ThisDeployment as S3Deployment };

export default ThisDeployment;
