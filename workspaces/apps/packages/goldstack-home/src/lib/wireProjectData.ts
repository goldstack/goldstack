import type { AWSAPIKeyUser } from '@goldstack/infra-aws';
import type { ProjectData } from '@goldstack/project-repository';

export const wireProjectData = (data: ProjectData): ProjectData => {
  // ensure at least one deployment configured per project
  data.packageConfigs.forEach((packageConfig) => {
    const deployments = packageConfig.package.deployments;
    if (deployments.length === 0) {
      deployments.push({
        name: data.deploymentNames[0],
        configuration: {},
        awsUser: data.awsUsers[0].name,
        awsRegion: (data.awsUsers[0].config as AWSAPIKeyUser).awsDefaultRegion,
      });
    } else {
      deployments.forEach((deployment) => {
        deployment.name = data.deploymentNames[0];
        deployment.awsUser = data.awsUsers[0].name;

        deployment.awsRegion = (data.awsUsers[0].config as AWSAPIKeyUser).awsDefaultRegion;
      });
    }
  });
  return data;
};
