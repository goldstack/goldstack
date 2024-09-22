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
            'workspaces/templates/packages/template-metadata/src/deploySets/hetznerVPS.README.md',
          packageConfigurations: [
            {
              packageName: 'hetzner-vps-1',
              configuration: {},
              deployments: [
                {
                  name: 'prod',
                  awsUser: 'goldstack-dev',
                  awsRegion: 'us-west-2',
                  configuration: {
                    location: 'hil',
                    serverType: 'cpx11',
                    sshUserFingerprint:
                      '73:db:08:81:7f:fe:34:c3:40:2e:10:d0:89:a7:b7:12',
                    serverName: 'goldstack-ci-test',
                    environmentVariables: [
                      {
                        name: 'DUMMY_ENV',
                        value: 'I rock',
                      },
                      {
                        name: 'HTTP_PORT',
                        value: '80',
                      },
                      {
                        name: 'HTTPS_PORT',
                        value: '443',
                      },
                    ],
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
