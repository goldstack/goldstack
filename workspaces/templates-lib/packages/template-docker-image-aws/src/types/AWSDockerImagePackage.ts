import type { Package, Configuration } from '@goldstack/utils-package';

import type { AWSDeployment } from '@goldstack/infra-aws';
import type { TerraformDeployment } from '@goldstack/utils-terraform';
import type { Deployment } from '@goldstack/infra';

/**
 * Defines the name for the docker repository. This name must be unique in the AWS region.
 *
 * @title Repository Name
 */
type RepositoryName = string;

export interface AWSDockerImageDeploymentConfiguration {
  repositoryName: RepositoryName;
}

/**
 * Configures a static website deployment.
 *
 * @title Deployment
 */
export interface AWSDockerImageDeployment extends Deployment, AWSDeployment, TerraformDeployment {
  configuration: AWSDockerImageDeploymentConfiguration;
}

/**
 * Places where the website should be deployed to.
 *
 * @title Deployments
 */
export type Deployments = AWSDockerImageDeployment[];

/**
 * Defines the tag for identifying the docker image.
 *
 * @title Image Tag
 *
 */
type ImageTag = string;

/**
 * Configures a docker image deployed to AWS.
 *
 * @title AWS Docker Image Configuration
 *
 */
export interface AWSDockerImagePackageConfiguration extends Configuration {
  imageTag: ImageTag;
}

/**
 * A docker image hosted on AWS.
 *
 * @title AWS Docker Image Package
 */
export interface AWSDockerImagePackage extends Package {
  configuration: AWSDockerImagePackageConfiguration;
  deployments: Deployments;
}
