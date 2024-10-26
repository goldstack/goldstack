import { ProjectConfiguration } from '@goldstack/utils-project';
import { DeploySetConfig } from '@goldstack/template-build-set';

export const createLambdaNodeTriggerBuildSetConfig =
  async (): Promise<DeploySetConfig> => {
    const projectConfiguration: ProjectConfiguration = {
      projectName: 'project-lambda-node-trigger',
      rootTemplateReference: {
        templateName: 'yarn-pnp-monorepo',
      },
      packages: [
        {
          packageName: 'lambda-node-trigger-1',
          templateReference: {
            templateName: 'lambda-node-trigger',
          },
        },
      ],
    };

    const hash = new Date().getTime();
    const setConfig: DeploySetConfig = {
      buildSetName: 'lambda-node-trigger',
      buildTemplates: ['yarn-pnp-monorepo', 'lambda-node-trigger'],
      deployTemplates: ['lambda-node-trigger'],
      projects: [
        {
          projectConfiguration,
          rootTests: [
            'assert-package-files',
            'assert-root-files',
            'root-build',
          ],
          // targetRepo: 'goldstack/python-aws-lambda-job-template',
          // repoReadme:
          //   'workspaces/templates/packages/template-metadata/src/deploySets/lambdaPythonJob.README.md',
          packageConfigurations: [
            {
              packageName: 'lambda-node-trigger-1',
              configuration: {},
              deployments: [
                {
                  name: 'prod',
                  awsUser: 'goldstack-dev',
                  awsRegion: 'us-west-2',
                  configuration: {
                    lambdaName: `gs-ci-lambda-node-trigger-${hash}`,
                    schedule: 'rate(1 minute)',
                    sqsQueueName: 'gs-ci-node-trigger-sqs-test',
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
