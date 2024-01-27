import { ProjectConfiguration } from '@goldstack/utils-project';
import { DeploySetConfig } from '@goldstack/template-build-set';

export const createDynamoDBBuildSetConfig =
  async (): Promise<DeploySetConfig> => {
    const projectConfiguration: ProjectConfiguration = {
      projectName: 'project-dynamodb',
      rootTemplateReference: {
        templateName: 'yarn-pnp-monorepo',
      },
      packages: [
        {
          packageName: 'dynamodb-1',
          templateReference: {
            templateName: 'dynamodb',
          },
        },
      ],
    };

    const hash = new Date().getTime();
    const setConfig: DeploySetConfig = {
      buildSetName: 'dynamodb',
      buildTemplates: ['yarn-pnp-monorepo', 'dynamodb'],
      deployTemplates: ['dynamodb'],
      projects: [
        {
          projectConfiguration,
          rootTests: [
            'assert-package-files',
            'assert-root-files',
            'root-build',
          ],
          targetRepo: 'goldstack/dynamodb-boilerplate',
          repoReadme:
            'workspaces/templates/packages/template-metadata/src/deploySets/dynamodb.README.md',
          packageConfigurations: [
            {
              packageName: 'dynamodb-1',
              configuration: {},
              deployments: [
                {
                  name: 'prod',
                  awsUser: 'goldstack-dev',
                  awsRegion: 'us-west-2',
                  configuration: {
                    tableName: `goldstack-ci-test-dynamodb-${hash}`,
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
