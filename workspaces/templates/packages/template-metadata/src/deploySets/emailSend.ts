import type { ProjectConfiguration } from '@goldstack/utils-project';
import type { DeploySetConfig } from '@goldstack/template-build-set';

export const createEmailSendBuildSetConfig = async (): Promise<DeploySetConfig> => {
  const projectConfiguration: ProjectConfiguration = {
    projectName: 'project-email-send',
    rootTemplateReference: {
      templateName: 'yarn-pnp-monorepo',
    },
    packages: [
      {
        packageName: 'email-send-1',
        templateReference: {
          templateName: 'email-send',
        },
      },
    ],
  };

  const hash = new Date().getTime();
  const setConfig: DeploySetConfig = {
    buildSetName: 'email-send',
    buildTemplates: ['yarn-pnp-monorepo', 'email-send'],
    deployTemplates: ['email-send'],
    projects: [
      {
        projectConfiguration,
        rootTests: ['assert-package-files', 'assert-root-files', 'root-build'],
        targetRepo: 'goldstack/ses-terraform-typescript-boilerplate',
        repoReadme:
          'workspaces/templates/packages/template-metadata/src/deploySets/emailSend.README.md',
        packageConfigurations: [
          {
            packageName: 'email-send-1',
            configuration: {},
            deployments: [
              {
                name: 'prod',
                awsUser: 'goldstack-dev',
                awsRegion: 'us-west-2',
                configuration: {
                  domain: `email-send-${hash}.tests.dev.goldstack.party`,
                  hostedZoneDomain: 'dev.goldstack.party',
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
