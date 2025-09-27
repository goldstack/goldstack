import type { ProjectConfiguration } from '@goldstack/utils-project';
import type { DeploySetConfig } from '@goldstack/template-build-set';

export const createNextjsTailwindBuildSetConfig = async (): Promise<DeploySetConfig> => {
  const projectConfiguration: ProjectConfiguration = {
    projectName: 'project-nextjs-tailwind1',
    rootTemplateReference: {
      templateName: 'yarn-pnp-monorepo',
    },
    packages: [
      {
        packageName: 'app-nextjs-tailwind-1',
        templateReference: {
          templateName: 'app-nextjs-tailwind',
        },
      },
    ],
  };

  const setConfig: DeploySetConfig = {
    buildSetName: 'nextjs-tailwind',
    buildTemplates: ['yarn-pnp-monorepo', 'app-nextjs-tailwind'],
    deployTemplates: ['app-nextjs-tailwind'],
    projects: [
      {
        projectConfiguration,
        rootTests: ['assert-package-files', 'assert-root-files', 'root-build'],
        packageConfigurations: [
          {
            packageName: 'app-nextjs-tailwind-1',
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
