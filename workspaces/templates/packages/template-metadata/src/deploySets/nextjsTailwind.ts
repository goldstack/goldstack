import type { DeploySetConfig } from '@goldstack/template-build-set';
import type { ProjectConfiguration } from '@goldstack/utils-project';

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
        targetRepo: 'goldstack/nextjs-tailwind',
        repoReadme:
          'workspaces/templates/packages/template-metadata/src/deploySets/nextjsTailwind.README.md',
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
