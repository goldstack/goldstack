import type { AWSUser } from '@goldstack/infra-aws';
import type { PackageConfig } from '@goldstack/project-config';
import type { ProjectConfiguration } from '@goldstack/utils-project';

interface ProjectData {
  packageConfigs: PackageConfig[];
  projectId: string;
  project: ProjectConfiguration;
  deploymentNames: string[];
  awsUsers: AWSUser[];
}

export default ProjectData;
