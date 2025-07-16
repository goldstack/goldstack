import type { ProjectConfiguration } from '@goldstack/utils-project';
import type { DeploySetConfig } from '@goldstack/template-build-set';

export const createNextjsBuildSetConfig = async (): Promise<DeploySetConfig> => {
  const projectConfiguration: ProjectConfiguration = {
    projectName: 'project-nextjs1',
    rootTemplateReference: {
      templateName: 'yarn-pnp-monorepo',
    },
    packages: [
      {
        packageName: 'app-nextjs-1',
        templateReference: {
          templateName: 'app-nextjs',
        },
      },
    ],
  };

  const setConfig: DeploySetConfig = {
    buildSetName: 'nextjs',
    buildTemplates: ['yarn-pnp-monorepo', 'app-nextjs'],
    deployTemplates: ['app-nextjs'],
    projects: [
      {
        projectConfiguration,
        rootTests: ['assert-package-files', 'assert-root-files', 'root-build'],
        packageConfigurations: [
          {
            packageName: 'app-nextjs-1',
            configuration: {},
            deployments: [],
            packageTests: [
              'assert-package-files',
              'ensure-babelrc-does-not-exist',
              'package-build',
            ],
            packageCleanUp: [],
          },
        ],
      },
    ],
  };

  return setConfig;
};
