import { ProjectConfiguration } from '@goldstack/utils-project';
import { DeploySetConfig } from '@goldstack/template-build-set';

export const createHetznerVPSBuildSetConfig =
  async (): Promise<DeploySetConfig> => {
    const projectConfiguration: ProjectConfiguration = {
      projectName: 'project-hetzner-vps',
      rootTemplateReference: {
        templateName: 'yarn-pnp-monorepo',
      },
      packages: [
        {
          packageName: 'hetzner-vps-1',
          templateReference: {
            templateName: 'hetzner-vps',
          },
        },
      ],
    };

    const hash = new Date().getTime();
    const setConfig: DeploySetConfig = {
      buildSetName: 'hetzner-vps',
      buildTemplates: ['yarn-pnp-monorepo', 'hetzner-vps'],
      deployTemplates: ['hetzner-vps'],
      projects: [
        {
          projectConfiguration,
          rootTests: [
            'assert-package-files',
            'assert-root-files',
            'root-build',
          ],
          targetRepo: 'goldstack/hetzner-vps-template',
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
