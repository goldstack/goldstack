import type { Deployment } from '@goldstack/infra';
import type { AWSDeployment } from '@goldstack/infra-aws';
import type { TerraformDeployment } from '@goldstack/utils-terraform';

import type { DynamoDBDeploymentConfiguration } from './DynamoDBDeploymentConfiguration';

export type { AWSDeployment, TerraformDeployment, Deployment, DynamoDBDeploymentConfiguration };

export interface ThisDeployment extends Deployment, AWSDeployment, TerraformDeployment {
  configuration: DynamoDBDeploymentConfiguration;
}

export type { ThisDeployment as DynamoDBDeployment };

export default ThisDeployment;
