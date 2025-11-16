import type { DeploySetConfig } from '@goldstack/template-build-set';
import type { ProjectConfiguration } from '@goldstack/utils-project';

export const createLambdaPythonJobBuildSetConfig = async (): Promise<DeploySetConfig> => {
  const projectConfiguration: ProjectConfiguration = {
    projectName: 'project-lambda-python-job',
    rootTemplateReference: {
      templateName: 'yarn-pnp-monorepo',
    },
    packages: [
      {
        packageName: 'lambda-python-job-1',
        templateReference: {
          templateName: 'lambda-python-job',
        },
      },
    ],
  };

  const hash = new Date().getTime();
  const setConfig: DeploySetConfig = {
    buildSetName: 'lambda-python-job',
    buildTemplates: ['yarn-pnp-monorepo', 'lambda-python-job'],
    deployTemplates: ['lambda-python-job'],
    projects: [
      {
        projectConfiguration,
        rootTests: ['assert-package-files', 'assert-root-files', 'root-build'],
        targetRepo: 'goldstack/python-aws-lambda-job-template',
        repoReadme:
          'workspaces/templates/packages/template-metadata/src/deploySets/lambdaPythonJob.README.md',
        packageConfigurations: [
          {
            packageName: 'lambda-python-job-1',
            configuration: {},
            deployments: [
              {
                name: 'prod',
                awsUser: 'goldstack-dev',
                awsRegion: 'us-west-2',
                configuration: {
                  lambdaName: `goldstack-ci-test-lambda-python-job-${hash}`,
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
