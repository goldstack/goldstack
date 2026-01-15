import {
  type InfraAwsStaticWebsiteCliParams,
  infraAwsStaticWebsiteCli,
} from '@goldstack/template-static-website-aws';
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
import { deployCloudFrontFunction } from './cloudFrontFunctionDeploy';
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
      .option('cf-function', {
        type: 'boolean',
        describe: 'Use CloudFront Functions instead of Lambda@Edge for routing',
        default: false,
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
      const infraOperation = argv._[1] as string;
      let targetVersion: string | undefined;
      let confirm: boolean | undefined;
      let commandArgs: string[] | undefined;

      if (infraOperation === 'upgrade') {
        targetVersion = argv.targetVersion;
      } else if (infraOperation === 'destroy') {
        confirm = argv.yes;
      } else if (infraOperation === 'terraform') {
        commandArgs = opArgs.slice(2);
      }

      const params: InfraAwsStaticWebsiteCliParams = {
        operation: infraOperation,
        deploymentName: argv.deployment,
        targetVersion,
        confirm,
        commandArgs,
      };
      await infraAwsStaticWebsiteCli(config, params);
      return;
    }

    if (command === 'deploy') {
      const deploymentName = argv.deployment;
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
      const params: InfraAwsStaticWebsiteCliParams = {
        operation: 'deploy',
        deploymentName,
      };
      await infraAwsStaticWebsiteCli(config, params);
      const deployment = packageConfig.getDeployment(deploymentName);
      const deploymentState = readDeploymentState('./', deployment.name);

      if (argv['cf-function']) {
        await deployCloudFrontFunction({
          deployment,
          deploymentState: deploymentState,
        });
      } else {
        await deployEdgeLambda({
          deployment,
          deploymentState: deploymentState,
        });
      }
      return;
    }

    fatal(`Unknown command: ${command}`);
    throw new Error();
  });
};
