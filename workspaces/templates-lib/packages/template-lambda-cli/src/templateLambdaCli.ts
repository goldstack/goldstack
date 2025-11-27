import { wrapCli } from '@goldstack/utils-cli';
import { warn } from '@goldstack/utils-log';
import { buildCli, buildDeployCommands } from '@goldstack/utils-package';
import { PackageConfig } from '@goldstack/utils-package-config';
import { infraCommands } from '@goldstack/utils-terraform';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';
import { deployCli } from './templateLambdaCliDeploy';

export * from './types/LambdaPackage';

import yargs from 'yargs';
import type { LambdaDeployment, LambdaPackage } from './types/LambdaPackage';

export { deployCli as deployLambda } from './templateLambdaCliDeploy';

export const run = async (args: string[]): Promise<void> => {
  await wrapCli(async () => {
    const argv = await buildCli({
      yargs,
      deployCommands: buildDeployCommands(),
      infraCommands: infraCommands(),
    })
      .help()
      .parse(args);

    const packageConfig = new PackageConfig<LambdaPackage, LambdaDeployment>({
      packagePath: './',
    });

    const config = packageConfig.getConfig();
    const [, , , ...opArgs] = args;
    const command = argv._[0];

    if (command === 'infra') {
      if (opArgs.length < 1 || !opArgs[0]) {
        throw new Error('No infrastructure operation provided');
      }
      if (opArgs.length < 2 || !opArgs[1]) {
        throw new Error('No deployment provided');
      }

      await terraformAwsCli(opArgs);
      return;
    }

    if (command === 'deploy') {
      // Determine deployment name from parsed argv (positional) or fallback to argv._ array
      const deploymentName = argv.deployment;

      if (!deploymentName) {
        throw new Error('No deployment provided');
      }

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
      await deployCli(packageConfig.getDeployment(deploymentName));
      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};
