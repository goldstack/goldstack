import { ProjectConfiguration } from '@goldstack/utils-project';
import { DeploySetConfig } from '@goldstack/template-build-set';

export const createServerSideRenderingBuildSetConfig = async (): Promise<DeploySetConfig> => {
  const projectConfiguration: ProjectConfiguration = {
    projectName: 'project-server-side-rendering',
    rootTemplateReference: {
      templateName: 'yarn-pnp-monorepo',
    },
    packages: [
      {
        packageName: 'server-side-rendering-1',
        templateReference: {
          templateName: 'server-side-rendering',
        },
      },
    ],
  };

  const hash = new Date().getTime();
  const setConfig: DeploySetConfig = {
    buildSetName: 'server-side-rendering',
    buildTemplates: ['yarn-pnp-monorepo', 'server-side-rendering'],
    deployTemplates: ['server-side-rendering'],
    projects: [
      {
        projectConfiguration,
        rootTests: ['assert-package-files', 'assert-root-files', 'root-build'],
        packageConfigurations: [
          {
            packageName: 'server-side-rendering-1',
            configuration: {},
            deployments: [
              {
                name: 'prod',
                awsUser: 'goldstack-dev',
                awsRegion: 'us-west-2',
                configuration: {
                  lambdaNamePrefix: `goldstack-ci-test-server-side-rendering-${hash}`,
                  domain: `server-side-rendering-${hash}.tests.dev.goldstack.party`,
                  hostedZoneDomain: 'dev.goldstack.party',
                  cors: '',
                  lambdas: {},
                },
                tfVersion: '1.1',
              },
            ],
            packageTests: [
              'assert-package-files',
              'infra-up',
              'deploy',
              'assert-rest-api',
            ],
            packageCleanUp: ['infra-destroy'],
          },
        ],
      },
    ],
  };
  return setConfig;
};
