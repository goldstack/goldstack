import { ProjectConfiguration } from '@goldstack/utils-project';
import { DeploySetConfig } from '@goldstack/template-build-set';

export const createNoInfraBuildSetConfig = async (): Promise<DeploySetConfig> => {
  const projectConfiguration: ProjectConfiguration = {
    projectName: 'project-no-infra',
    rootTemplateReference: {
      templateName: 'yarn-pnp-monorepo',
    },
    packages: [
      {
        packageName: 's3-1',
        templateReference: {
          templateName: 's3',
        },
      },
      {
        packageName: 'lambda-express-1',
        templateReference: {
          templateName: 'lambda-express',
        },
      },
      {
        packageName: 'email-send-1',
        templateReference: {
          templateName: 'email-send',
        },
      },
      {
        packageName: 'app-nextjs-1',
        templateReference: {
          templateName: 'app-nextjs',
        },
      },
      {
        packageName: 'app-nextjs-bootstrap-1',
        templateReference: {
          templateName: 'app-nextjs-bootstrap',
        },
      },
      {
        packageName: 'static-website-1',
        templateReference: {
          templateName: 'static-website-aws',
        },
      },
    ],
  };

  const setConfig: DeploySetConfig = {
    buildSetName: 'no-infra',
    buildTemplates: [
      'yarn-pnp-monorepo',
      's3',
      'lambda-express',
      'email-send',
      'app-nextjs',
      'app-nextjs-bootstrap',
      'static-website-aws',
    ],
    deployTemplates: [],
    projects: [
      {
        projectConfiguration,
        targetRepo: 'goldstack/typescript-monorepo-boilerplate',
        repoReadme:
          'workspaces/apps/packages/template-management-cli/src/deploySets/noInfra.README.md',
        rootTests: ['assert-package-files', 'assert-root-files', 'root-build'],
        packageConfigurations: [
          {
            packageName: 's3-1',
            configuration: {},
            deployments: [],
            packageTests: ['assert-package-files'],
            packageCleanUp: [],
          },
          {
            packageName: 'lambda-express-1',
            configuration: {},
            deployments: [],
            packageTests: ['assert-package-files'],
            packageCleanUp: [],
          },
          {
            packageName: 'email-send-1',
            configuration: {},
            deployments: [],
            packageTests: ['assert-package-files'],
            packageCleanUp: [],
          },
          {
            packageName: 'app-nextjs-1',
            configuration: {},
            deployments: [],
            packageTests: ['assert-package-files'],
            packageCleanUp: [],
          },
          {
            packageName: 'app-nextjs-bootstrap-1',
            configuration: {},
            deployments: [],
            packageTests: ['assert-package-files'],
            packageCleanUp: [],
          },
          {
            packageName: 'static-website-1',
            configuration: {},
            deployments: [],
            packageTests: ['assert-package-files'],
            packageCleanUp: [],
          },
        ],
      },
    ],
  };
  return setConfig;
};
