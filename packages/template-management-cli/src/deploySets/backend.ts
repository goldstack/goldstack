import { ProjectConfiguration } from '@goldstack/utils-project';
import { DeploySetConfig } from '@goldstack/template-build-set';

export const createBackendBuildSetConfig = async (): Promise<DeploySetConfig> => {
  const projectConfiguration: ProjectConfiguration = {
    projectName: 'project-backend',
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
    ],
  };

  const hash = new Date().getTime();
  const setConfig: DeploySetConfig = {
    buildSetName: 'backend',
    buildTemplates: ['yarn-pnp-monorepo', 's3', 'lambda-express', 'email-send'],
    deployTemplates: [
      'yarn-pnp-monorepo',
      's3',
      'lambda-express',
      'email-send',
    ],
    projects: [
      {
        projectConfiguration,
        rootTests: ['assert-package-files', 'assert-root-files', 'root-build'],
        packageConfigurations: [
          {
            packageName: 's3-1',
            configuration: {},
            deployments: [
              {
                name: 'prod',
                awsUser: 'goldstack-dev',
                awsRegion: 'us-west-2',
                configuration: {
                  bucketName: `goldstack-ci-test-s3-${hash}`,
                },
              },
            ],
            packageTests: ['assert-package-files', 'infra-up'],
            packageCleanUp: ['infra-destroy'],
          },
          {
            packageName: 'lambda-express-1',
            configuration: {},
            deployments: [
              {
                name: 'prod',
                awsUser: 'goldstack-dev',
                awsRegion: 'us-west-2',
                configuration: {
                  lambdaName: `goldstack-ci-test-lambda-express-${hash}`,
                  apiDomain: `lambda-express-${hash}.tests.dev.goldstack.party`,
                  hostedZoneDomain: 'dev.goldstack.party',
                  cors: '',
                },
              },
            ],
            packageTests: ['assert-package-files', 'infra-up'],
            packageCleanUp: ['infra-destroy'],
          },
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
            packageCleanUp: ['infra-destroy'],
          },
        ],
      },
    ],
  };
  return setConfig;
};
