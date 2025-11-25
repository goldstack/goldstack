import { infraAwsStaticWebsiteCli } from '@goldstack/template-static-website-aws';
import { wrapCli } from '@goldstack/utils-cli';
import { fatal, warn } from '@goldstack/utils-log';
import type { NextjsDeployment, NextjsPackage } from './types/NextJsPackage';

export type { NextjsPackage };

import { readDeploymentState } from '@goldstack/infra';
import { buildCli, buildDeployCommands } from '@goldstack/utils-package';
import { PackageConfig } from '@goldstack/utils-package-config';
import { infraCommands } from '@goldstack/utils-terraform';
import yargs from 'yargs';
import { deployEdgeLambda } from './edgeLambdaDeploy';
import { setNextjsEnvironmentVariables } from './nextjsEnvironment';

export const run = async (args: string[]): Promise<void> => {
  await wrapCli(async () => {
    const argv = await buildCli({
      yargs,
      deployCommands: buildDeployCommands(),
      infraCommands: infraCommands(),
    })
      .command('set-nextjs-env <deployment>', 'Set NextJs environment variables', () => {
        return yargs.positional('deployment', {
          type: 'string',
          describe: 'Name of the deployment this command should be applied to',
          demandOption: true,
        });
      })
      .help()
      .parse();
    const packageConfig = new PackageConfig<NextjsPackage, NextjsDeployment>({
      packagePath: './',
    });
    const config = packageConfig.getConfig();
    const command = argv._[0];
    const [, , , ...opArgs] = args;

    if (command === 'set-nextjs-env') {
      await setNextjsEnvironmentVariables(packageConfig.getDeployment(opArgs[0]));
      return;
    }

    if (command === 'infra') {
      await infraAwsStaticWebsiteCli(config, opArgs);
      return;
    }

    if (command === 'deploy') {
      const deploymentName = opArgs[0];
      if (!packageConfig.hasDeployment(deploymentName)) {
        if (argv['ignore-missing-deployments']) {
          warn(
            `Deployment '${deploymentName}' does not exist. Skipping deploy due to --ignore-missing-deployments flag.`,
          );
          return;
        } else {
          throw new Error(`Cannot find configuration for deployment '${deploymentName}'`);
        }
      }
      await infraAwsStaticWebsiteCli(config, ['deploy', ...opArgs]);
      const deployment = packageConfig.getDeployment(deploymentName);
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
