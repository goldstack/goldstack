import { deployLambda } from '@goldstack/template-lambda-cli';
import { wrapCli } from '@goldstack/utils-cli';
import { warn } from '@goldstack/utils-log';
import { buildCli, buildDeployCommands } from '@goldstack/utils-package';
import { PackageConfig } from '@goldstack/utils-package-config';
import { infraCommands } from '@goldstack/utils-terraform';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';

export * from './types/LambdaHttpPackage';

import yargs from 'yargs';
import type { LambdaExpressDeployment, LambdaExpressPackage } from './types/LambdaHttpPackage';

/**
 * Runs the CLI for the Lambda HTTP template.
 *
 * @param args - Command line arguments.
 * @returns {Promise<void>} A promise that resolves when the CLI execution is complete.
 */
export const run = async (args: string[]): Promise<void> => {
  await wrapCli(async () => {
    const argv = await buildCli({
      yargs,
      deployCommands: buildDeployCommands(),
      infraCommands: infraCommands(),
    })
      .help()
      .parse();

    const packageConfig = new PackageConfig<LambdaExpressPackage, LambdaExpressDeployment>({
      packagePath: './',
    });

    const _config = packageConfig.getConfig();
    const [, , , ...opArgs] = args;
    const command = argv._[0];

    if (command === 'infra') {
      const infraOperation = argv._[1] as string;
      const deploymentName = argv.deployment;
      let targetVersion: string | undefined;
      let confirm: boolean | undefined;
      let commandArgs: string[] | undefined;

      if (infraOperation === 'upgrade') {
        targetVersion = argv.targetVersion;
      } else if (infraOperation === 'terraform') {
        commandArgs = opArgs.slice(2);
      } else if (infraOperation === 'destroy') {
        confirm = argv.yes;
      }

      await terraformAwsCli({
        infraOperation,
        deploymentName,
        targetVersion,
        confirm,
        commandArguments: commandArgs,
        ignoreMissingDeployments: argv['ignore-missing-deployments'] || false,
        skipConfirmations: argv.yes || false,
        options: undefined,
      });
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
      await deployLambda(packageConfig.getDeployment(deploymentName));
      return;
    }

    throw new Error(`Unknown command: ${command}`);
  });
};
