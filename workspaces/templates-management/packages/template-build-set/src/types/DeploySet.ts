import { ProjectConfiguration } from '@goldstack/utils-project';
import { Configuration } from '@goldstack/utils-package';
import { Deployment } from '@goldstack/infra';

export interface DeploySetPackageConfig {
  packageName: string;
  deployments: Deployment[];
  configuration: Configuration;
  packageTests: string[];
  packageCleanUp: string[];
}

export interface DeploySetProjectConfig {
  projectConfiguration: ProjectConfiguration;
  packageConfigurations: DeploySetPackageConfig[];
  rootTests: string[];
  /**
   * Repository that deploy set should be cloned into
   */
  targetRepo?: string;
  /**
   * Path to a readme file in the Goldstack repository that the Readme in the repo should be overriden with.
   */
  repoReadme?: string;
}

export interface DeploySetConfig {
  buildSetName: string;
  buildTemplates: string[];
  deployTemplates: string[];
  projects: DeploySetProjectConfig[];
}
