import { Template } from '@goldstack/utils-template';
import { wrapCli } from '@goldstack/utils-cli';
import { fatal } from '@goldstack/utils-log';
import { infraAwsStaticWebsiteCli } from '@goldstack/template-static-website-aws';
import { NextjsPackage, NextjsDeployment } from './types/NextJsPackage';

export { NextjsPackage };

import yargs from 'yargs';
import { buildCli, buildDeployCommands } from '@goldstack/utils-package';
import { readDeploymentState } from '@goldstack/infra';
import { infraCommands } from '@goldstack/utils-terraform';

import { PackageConfig } from '@goldstack/utils-package-config';
import { setNextjsEnvironmentVariables } from './nextjsEnvironment';

import { deployEdgeLambda } from './edgeLambdaDeploy';

export const run = async (args: string[]): Promise<void> => {
  await wrapCli(async () => {
    const argv = buildCli({
      yargs,
      deployCommands: buildDeployCommands(),
      infraCommands: infraCommands(),
    })
      .command(
        'set-nextjs-env <deployment>',
        'Set NextJs environment variables',
        () => {
          return yargs.positional('deployment', {
            type: 'string',
            describe:
              'Name of the deployment this command should be applied to',
            demandOption: true,
          });
        }
      )
      .help().argv;
    const packageConfig = new PackageConfig<NextjsPackage, NextjsDeployment>({
      packagePath: './',
    });
    const config = packageConfig.getConfig();
    const command = argv._[0];
    const [, , , ...opArgs] = args;

    if (command === 'set-nextjs-env') {
      await setNextjsEnvironmentVariables(
        packageConfig.getDeployment(config, opArgs[0])
      );
      return;
    }

    if (command === 'infra') {
      await infraAwsStaticWebsiteCli(config, opArgs);
      return;
    }

    if (command === 'deploy') {
      await infraAwsStaticWebsiteCli(config, ['deploy', ...opArgs]);
      const deployment = packageConfig.getDeployment(config, opArgs[0]);
      const deploymentState = readDeploymentState('./', deployment.name);
      await deployEdgeLambda({
        deployment,
        deploymentState: deploymentState,
      });
      return;
    }

    fatal('Unknown command: ' + command);
    throw new Error();
  });
};

export class AppNextJsTemplate implements Template {
  getTemplateName(): string {
    return 'app-nextjs';
  }
  getJsonSchema(): object {
    return {};
  }
}

export class AppNextJsBootstrapTemplate implements Template {
  getTemplateName(): string {
    return 'app-nextjs-bootstrap';
  }
  getJsonSchema(): object {
    return {};
  }
}
