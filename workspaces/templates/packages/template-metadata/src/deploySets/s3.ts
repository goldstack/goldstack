import { ProjectConfiguration } from '@goldstack/utils-project';
import { DeploySetConfig } from '@goldstack/template-build-set';

export const createS3BuildSetConfig = async (): Promise<DeploySetConfig> => {
  const projectConfiguration: ProjectConfiguration = {
    projectName: 'project-s3',
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
    ],
  };

  const hash = new Date().getTime();
  const setConfig: DeploySetConfig = {
    buildSetName: 'backend-nodejs-express',
    buildTemplates: ['yarn-pnp-monorepo', 's3'],
    deployTemplates: ['s3'],
    projects: [
      {
        projectConfiguration,
        rootTests: ['assert-package-files', 'assert-root-files', 'root-build'],
        targetRepo: 'goldstack/ses-terraform-typescript-boilerplate',
        repoReadme:
          'https://github.com/goldstack/s3-terraform-typescript-boilerplate',
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
        ],
      },
    ],
  };
  return setConfig;
};
