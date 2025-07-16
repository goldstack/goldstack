import type { ProjectConfiguration } from '@goldstack/utils-project';
import type { DeploySetConfig } from '@goldstack/template-build-set';

export const createUserManagementBuildSetConfig = async (): Promise<DeploySetConfig> => {
  const projectConfiguration: ProjectConfiguration = {
    projectName: 'project-user-management',
    rootTemplateReference: {
      templateName: 'yarn-pnp-monorepo',
    },
    packages: [
      {
        packageName: 'user-management-1',
        templateReference: {
          templateName: 'user-management',
        },
      },
    ],
  };

  const hash = new Date().getTime();
  const setConfig: DeploySetConfig = {
    buildSetName: 'user-management',
    buildTemplates: ['yarn-pnp-monorepo', 'user-management'],
    deployTemplates: ['user-management'],
    projects: [
      {
        projectConfiguration,
        targetRepo: 'goldstack/cognito-nodejs-template',
        repoReadme:
          'workspaces/templates/packages/template-metadata/src/deploySets/userManagement.README.md',
        rootTests: ['assert-package-files', 'assert-root-files', 'root-build'],
        packageConfigurations: [
          {
            packageName: 'user-management-1',
            configuration: {},
            deployments: [
              {
                name: 'prod',
                awsUser: 'goldstack-dev',
                awsRegion: 'us-west-2',
                configuration: {
                  cognitoDomain: `auth-integration-${hash}.dev.goldstack.party`,
                  userPoolName: `integration-pool-${hash}`,
                  hostedZoneDomain: 'dev.goldstack.party',
                  cookieDomain: '.dev.goldstack.party',
                  cookieSameSite: 'None',
                  callbackUrl: 'https://ssr.examples.templates.dev.goldstack.party',
                },
              },
            ],
            packageTests: ['assert-package-files', 'infra-up'],
            packageCleanUp: ['infra-destroy', 'destroy-state'],
          },
        ],
      },
    ],
  };
  return setConfig;
};
