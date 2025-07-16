import type { ProjectConfiguration } from '@goldstack/utils-project';
import type { DeploySetConfig } from '@goldstack/template-build-set';

export const createBackendGoGinBuildSetConfig =
  async (): Promise<DeploySetConfig> => {
    const projectConfiguration: ProjectConfiguration = {
      projectName: 'project-backend-go',
      rootTemplateReference: {
        templateName: 'yarn-pnp-monorepo',
      },
      packages: [
        {
          packageName: 'lambda-go-gin-1',
          templateReference: {
            templateName: 'lambda-go-gin',
          },
        },
      ],
    };

    const hash = new Date().getTime();
    const setConfig: DeploySetConfig = {
      buildSetName: 'backend-go-gin',
      buildTemplates: ['yarn-pnp-monorepo', 'lambda-go-gin'],
      deployTemplates: ['lambda-go-gin'],
      projects: [
        {
          projectConfiguration,
          rootTests: [
            'assert-package-files',
            'assert-root-files',
            'root-build',
          ],
          packageConfigurations: [
            {
              packageName: 'lambda-go-gin-1',
              configuration: {},
              deployments: [
                {
                  name: 'prod',
                  awsUser: 'goldstack-dev',
                  awsRegion: 'us-west-2',
                  configuration: {
                    lambdaName: `goldstack-ci-test-lambda-go-gin-${hash}`,
                    apiDomain: `lambda-go-gin-${hash}.tests.dev.goldstack.party`,
                    hostedZoneDomain: 'dev.goldstack.party',
                    cors: '',
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
