import { Deployment } from '@goldstack/infra';

/**
 * AWS region that infrastructure should be deployed to.
 *
 * @title AWS Deployment Region
 */
export type AWSDeploymentRegion =
  | 'us-east-1'
  | 'us-east-2'
  | 'us-west-1'
  | 'us-west-2'
  | 'af-south-1'
  | 'ap-east-1'
  | 'ap-south-1'
  | 'ap-northeast-3'
  | 'ap-northeast-2'
  | 'ap-southeast-1'
  | 'ap-southeast-2'
  | 'ap-northeast-1'
  | 'ca-central-1'
  | 'eu-central-1'
  | 'eu-west-1'
  | 'eu-west-2'
  | 'eu-south-1'
  | 'eu-west-3'
  | 'eu-north-1'
  | 'me-south-1'
  | 'sa-east-1';

/**
 * Name of the AWS user that is used to perform the deployment.
 *
 * @title AWS User Name
 */
export type AWSUserName = string;

export interface AWSDeployment extends Deployment {
  awsRegion: AWSDeploymentRegion;
  awsUser: AWSUserName;
}
