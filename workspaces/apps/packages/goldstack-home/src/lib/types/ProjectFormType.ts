import { ProjectName } from '@goldstack/utils-project';
import { AWSRegion } from '@goldstack/infra-aws/dist/types/awsAccount';

/**
 * Choose if you want to use this tool to define your development or production infrastructure.
 *
 * @title Deployment
 * @default "dev"
 */
type DeploymentChoice = 'prod' | 'dev';

export interface ProjectFormType {
  projectName: ProjectName;
  deployment: DeploymentChoice;

  /**
   * The AWS region where the infrastructure for this project should be deployed to.
   *
   * @default "us-east-2"
   */
  awsRegion: AWSRegion;
  [propName: string]: any;
}
