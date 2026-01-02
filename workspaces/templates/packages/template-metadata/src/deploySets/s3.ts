import type { DeploySetConfig } from '@goldstack/template-build-set';
import type { ProjectConfiguration } from '@goldstack/utils-project';

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

  const hash = Date.now();
  const setConfig: DeploySetConfig = {
    buildSetName: 's3',
    buildTemplates: ['yarn-pnp-monorepo', 's3'],
    deployTemplates: ['s3'],
    projects: [
      {
        projectConfiguration,
        rootTests: ['assert-package-files', 'assert-root-files', 'root-build'],
        targetRepo: 'goldstack/s3-terraform-typescript-boilerplate',
        repoReadme: 'workspaces/templates/packages/template-metadata/src/deploySets/s3.README.md',
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
            packageCleanUp: ['infra-destroy', 'destroy-state'],
          },
        ],
      },
    ],
  };
  return setConfig;
};
