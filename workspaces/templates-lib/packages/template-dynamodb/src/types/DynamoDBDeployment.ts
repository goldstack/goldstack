import { AWSDeployment } from '@goldstack/infra-aws';
import { TerraformDeployment } from '@goldstack/utils-terraform';
import { Deployment } from '@goldstack/infra';

import { DynamoDBDeploymentConfiguration } from './DynamoDBDeploymentConfiguration';

export type {
  AWSDeployment,
  TerraformDeployment,
  Deployment,
  DynamoDBDeploymentConfiguration,
};

export interface ThisDeployment
  extends Deployment,
    AWSDeployment,
    TerraformDeployment {
  configuration: DynamoDBDeploymentConfiguration;
}

export type { ThisDeployment as DynamoDBDeployment };

export default ThisDeployment;
