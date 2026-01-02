import type { DeploySetConfig } from '@goldstack/template-build-set';
import type { ProjectConfiguration } from '@goldstack/utils-project';

export const createBackendNodejsExpressBuildSetConfig = async (): Promise<DeploySetConfig> => {
  const projectConfiguration: ProjectConfiguration = {
    projectName: 'project-backend-nodejs-express',
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
    ],
  };

  const hash = Date.now();
  const setConfig: DeploySetConfig = {
    buildSetName: 'backend-nodejs-express',
    buildTemplates: ['yarn-pnp-monorepo', 's3', 'lambda-express'],
    deployTemplates: ['yarn-pnp-monorepo', 's3', 'lambda-express'],
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
            packageTests: ['assert-package-files', 'infra-up', 'deploy', 'assert-rest-api'],
            packageCleanUp: ['infra-destroy', 'destroy-state'],
          },
        ],
      },
    ],
  };
  return setConfig;
};
