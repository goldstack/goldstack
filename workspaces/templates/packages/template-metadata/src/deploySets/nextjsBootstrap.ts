import { ProjectConfiguration } from '@goldstack/utils-project';
import { DeploySetConfig } from '@goldstack/template-build-set';

export const createNextjsBootstrapBuildSetConfig =
  async (): Promise<DeploySetConfig> => {
    const projectConfiguration: ProjectConfiguration = {
      projectName: 'project-nextjsbootstrap1',
      rootTemplateReference: {
        templateName: 'yarn-pnp-monorepo',
      },
      packages: [
        {
          packageName: 'app-nextjs-bootstrap-1',
          templateReference: {
            templateName: 'app-nextjs-bootstrap',
          },
        },
      ],
    };

    const hash = new Date().getTime();
    const websiteDomain =
      'nextjsbootstrap-' + hash + '.tests.dev.goldstack.party';

    const setConfig: DeploySetConfig = {
      buildSetName: 'nextjs-bootstrap',
      buildTemplates: ['yarn-pnp-monorepo', 'app-nextjs-bootstrap'],
      deployTemplates: ['app-nextjs-bootstrap'],
      projects: [
        {
          projectConfiguration,
          rootTests: [
            'print-directory-content',
            'assert-package-files',
            'assert-root-files',
            'root-build',
          ],
          targetRepo: 'goldstack/nextjs-bootstrap-boilerplate',
          repoReadme:
            'workspaces/templates/packages/template-metadata/src/deploySets/nextjsBootstrap.README.md',
          packageConfigurations: [
            {
              packageName: 'app-nextjs-bootstrap-1',
              configuration: {},
              deployments: [
                {
                  name: 'prod',
                  awsUser: 'goldstack-dev',
                  awsRegion: 'us-west-2',
                  configuration: {
                    hostedZoneDomain: 'dev.goldstack.party',
                    websiteDomain,
                    defaultCacheDuration: 10,
                  },
                },
              ],
              packageTests: [
                'print-directory-content',
                'assert-package-files',
                'package-build',
                // 'print-directory-content',
                // 'infra-up',
                // 'print-directory-content',
                // 'deploy',
                // 'print-directory-content',
                // 'assert-website',
              ],
              packageCleanUp: [
                // 'infra-destroy', 'destroy-state'
              ],
            },
          ],
        },
      ],
    };

    return setConfig;
  };
