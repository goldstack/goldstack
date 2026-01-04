import { wrapCli } from '@goldstack/utils-cli';
import { warn } from '@goldstack/utils-log';

import { infraAwsDockerImageCli } from './infraAwsDockerImage';

export { getDeploymentState, getRepo } from './infraAwsDockerImage';

import { buildCli, buildDeployCommands } from '@goldstack/utils-package';
import { PackageConfig } from '@goldstack/utils-package-config';
import { infraCommands } from '@goldstack/utils-terraform';
import type { Argv } from 'yargs';
import yargs from 'yargs';
import { apiDockerImageAwsCli } from './apiDockerImageAws';
import { AWSDockerImageDeployment, AWSDockerImagePackage } from './types/AWSDockerImagePackage';
export { AWSDockerImagePackage, AWSDockerImageDeployment };
export {
  getLogs,
  runTask,
  StartTaskResult,
  startTask,
} from './apiDockerImageAws';

export const getConfig = (): AWSDockerImagePackage => {
  const packageConfig = new PackageConfig<AWSDockerImagePackage, AWSDockerImageDeployment>({
    packagePath: './',
  });
  return packageConfig.getConfig();
};

export const getDeployment = (deploymentName: string): AWSDockerImageDeployment => {
  const packageConfig = new PackageConfig<AWSDockerImagePackage, AWSDockerImageDeployment>({
    packagePath: './',
  });
  return packageConfig.getDeployment(deploymentName);
};

const imageCommands = () => {
  const deploymentPositional = (yargs: Argv<any>): Argv<any> => {
    return yargs.positional('deployment', {
      type: 'string',
      describe: 'Name of the deployment this command should be applied to',
      demandOption: true,
    });
  };
  return (yargs: Argv<any>): Argv<any> => {
    return yargs
      .command('run <deployment>', 'Runs the image', deploymentPositional)
      .command('start <deployment>', 'Starts the image', deploymentPositional)
      .command('logs <taskId>', 'Prints the logs for an image', (yargs: Argv<any>): Argv<any> => {
        return yargs.positional('taskId', {
          type: 'string',
          describe: 'Id of the tasks for which logs should be obtained.',
          demandOption: true,
        });
      });
  };
};
export const run = async (args: string[]): Promise<void> => {
  await wrapCli(async () => {
    const argv = await buildCli({
      yargs,
      deployCommands: buildDeployCommands(),
      infraCommands: infraCommands(),
    })
      .command('image', 'Commands for working with images.', imageCommands())
      .help()
      .parse();

    const packageConfig = new PackageConfig<AWSDockerImagePackage, AWSDockerImageDeployment>({
      packagePath: './',
    });
    const config = packageConfig.getConfig();
    const command = argv._[0];

    const [, , , ...opArgs] = args;

    if (command === 'infra') {
      const deploymentName = opArgs[1];
      if (!packageConfig.hasDeployment(deploymentName)) {
        if (argv['ignore-missing-deployments']) {
          warn(
            `Deployment '${deploymentName}' does not exist. Skipping operation due to --ignore-missing-deployments flag.`,
          );
          return;
        } else {
          throw new Error(`Cannot find configuration for deployment '${deploymentName}'`);
        }
      }
      const deployment = packageConfig.getDeployment(deploymentName);
      await infraAwsDockerImageCli(config, deployment, opArgs);
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
      const deployment = packageConfig.getDeployment(deploymentName);
      await infraAwsDockerImageCli(config, deployment, ['deploy', ...opArgs]);
      return;
    }

    if (command === 'image') {
      const deploymentName = opArgs[1];
      if (!packageConfig.hasDeployment(deploymentName)) {
        if (argv['ignore-missing-deployments']) {
          warn(
            `Deployment '${deploymentName}' does not exist. Skipping operation due to --ignore-missing-deployments flag.`,
          );
          return;
        } else {
          throw new Error(`Cannot find configuration for deployment '${deploymentName}'`);
        }
      }
      const deployment = packageConfig.getDeployment(deploymentName);
      await apiDockerImageAwsCli(config, deployment, opArgs);
      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};
