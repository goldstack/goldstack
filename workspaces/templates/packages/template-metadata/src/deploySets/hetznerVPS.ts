import type { DeploySetConfig } from '@goldstack/template-build-set';
import type { ProjectConfiguration } from '@goldstack/utils-project';

export const createHetznerVPSBuildSetConfig = async (): Promise<DeploySetConfig> => {
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

  const setConfig: DeploySetConfig = {
    buildSetName: 'hetzner-vps',
    buildTemplates: ['yarn-pnp-monorepo', 'hetzner-vps'],
    deployTemplates: ['hetzner-vps'],
    projects: [
      {
        projectConfiguration,
        rootTests: ['assert-package-files', 'assert-root-files', 'root-build'],
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
                hetznerUser: 'local', // since in CI injected by environment variable
                configuration: {
                  location: 'hil',
                  serverType: 'cpx11',
                  sshUserFingerprint: '49:35:14:98:08:d4:71:a6:04:c2:f6:73:f0:68:2d:5c',
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
