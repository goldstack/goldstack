import { ProjectConfiguration } from '@goldstack/utils-project';
import { DeploySetConfig } from '@goldstack/template-build-set';

export const createBackendLambdaApiBuildSetConfig =
  async (): Promise<DeploySetConfig> => {
    const projectConfiguration: ProjectConfiguration = {
      projectName: 'project-backend-lambda-api',
      rootTemplateReference: {
        templateName: 'yarn-pnp-monorepo',
      },
      packages: [
        {
          packageName: 'lambda-api-1',
          templateReference: {
            templateName: 'serverless-api',
          },
        },
      ],
    };

    const hash = new Date().getTime();
    const setConfig: DeploySetConfig = {
      buildSetName: 'backend-lambda-api',
      buildTemplates: ['yarn-pnp-monorepo', 'serverless-api'],
      deployTemplates: ['serverless-api'],
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
              packageName: 'lambda-api-1',
              configuration: {},
              deployments: [
                {
                  name: 'prod',
                  awsUser: 'goldstack-dev',
                  awsRegion: 'us-west-2',
                  configuration: {
                    lambdaNamePrefix: `goldstack-ci-test-lambda-api-${hash}`,
                    apiDomain: `lambda-api-${hash}.tests.dev.goldstack.party`,
                    hostedZoneDomain: 'dev.goldstack.party',
                    cors: '',
                    lambdas: {},
                  },
                  tfVersion: '1.10',
                },
              ],
              packageTests: [
                'assert-package-files',
                'infra-up',
                'deploy',
                'assert-rest-api',
              ],
              packageCleanUp: ['infra-destroy', 'destroy-state'],
            },
          ],
        },
      ],
    };
    return setConfig;
  };
