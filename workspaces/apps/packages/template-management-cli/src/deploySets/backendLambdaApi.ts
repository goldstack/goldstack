import { ProjectConfiguration } from '@goldstack/utils-project';
import { DeploySetConfig } from '@goldstack/template-build-set';

export const createBackendLambdaApiBuildSetConfig = async (): Promise<DeploySetConfig> => {
  const projectConfiguration: ProjectConfiguration = {
    projectName: 'project-backend-lambda-api',
    rootTemplateReference: {
      templateName: 'yarn-pnp-monorepo',
    },
    packages: [
      {
        packageName: 'lambda-api-1',
        templateReference: {
          templateName: 'lambda-api',
        },
      },
    ],
  };

  // const hash = new Date().getTime();
  const setConfig: DeploySetConfig = {
    buildSetName: 'backend-lambda-api',
    buildTemplates: ['yarn-pnp-monorepo', 'lambda-api'],
    deployTemplates: ['yarn-pnp-monorepo', 'lambda-api'],
    projects: [],
  };
  return setConfig;
};
