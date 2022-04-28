import { ProjectConfiguration } from '@goldstack/utils-project';
import { DeploySetConfig } from '@goldstack/template-build-set';

export const createStaticWebsiteBuildSetConfig = async (): Promise<DeploySetConfig> => {
  const projectConfiguration: ProjectConfiguration = {
    projectName: 'project-static-website1',
    rootTemplateReference: {
      templateName: 'yarn-pnp-monorepo',
    },
    packages: [
      {
        packageName: 'app-nextjs-1',
        templateReference: {
          templateName: 'app-nextjs',
        },
      },
      {
        packageName: 'static-website-1',
        templateReference: {
          templateName: 'static-website-aws',
        },
      },
    ],
  };

  const hash = new Date().getTime();
  const websiteDomain = 'staticwebsite1-' + hash + '.tests.dev.goldstack.party';
  const websiteDomainRedirect =
    'www.staticwebsite1-' + hash + '.tests.dev.goldstack.party';

  const setConfig: DeploySetConfig = {
    buildSetName: 'static-website',
    buildTemplates: ['yarn-pnp-monorepo', 'app-nextjs', 'static-website-aws'],
    deployTemplates: ['app-nextjs', 'static-website-aws'],
    projects: [
      {
        projectConfiguration,
        targetRepo: 'goldstack/static-website-boilerplate',
        repoReadme:
          'workspaces/templates/packages/template-metadata/src/deploySets/staticWebsite.README.md',
        rootTests: ['assert-package-files', 'assert-root-files', 'root-build'],
        packageConfigurations: [
          {
            packageName: 'app-nextjs-1',
            configuration: {},
            deployments: [],
            packageTests: ['assert-package-files'],
            packageCleanUp: [],
          },
          {
            packageName: 'static-website-1',
            configuration: {},
            deployments: [
              {
                name: 'prod',
                awsUser: 'goldstack-dev',
                awsRegion: 'us-west-2',
                configuration: {
                  hostedZoneDomain: 'dev.goldstack.party',
                  websiteDomain,
                  websiteDomainRedirect,
                  defaultCacheDuration: 10,
                },
              },
            ],
            packageTests: [
              'assert-package-files',
              'infra-up',
              'deploy',
              'assert-static-website-aws-deployments',
            ],
            packageCleanUp: ['infra-destroy'],
          },
        ],
      },
    ],
  };

  return setConfig;
};
