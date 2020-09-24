import { PackageConfig } from '@goldstack/project-config';
import { ProjectConfiguration } from '@goldstack/utils-project';
import { AWSUser } from '@goldstack/infra-aws';

interface ProjectData {
  packageConfigs: PackageConfig[];
  projectId: string;
  project: ProjectConfiguration;
  deploymentNames: string[];
  awsUsers: AWSUser[];
}

export default ProjectData;
