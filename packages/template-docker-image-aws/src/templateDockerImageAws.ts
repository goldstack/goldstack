import { wrapCli } from '@goldstack/utils-cli';

import { Template } from '@goldstack/utils-template';
import { infraAwsDockerImageCli } from './infraAwsDockerImage';

import configSchema from './schemas/configSchema.json';

export { getRepo, getDeploymentState } from './infraAwsDockerImage';
import { apiDockerImageAwsCli } from './apiDockerImageAws';

import yargs from 'yargs';
import { buildCli, buildDeployCommands } from '@goldstack/utils-package';
import { infraCommands } from '@goldstack/utils-terraform';
import { Argv } from 'yargs';
import { PackageConfig } from '@goldstack/utils-package-config';
import {
  AWSDockerImagePackage,
  AWSDockerImageDeployment,
} from './types/AWSDockerImagePackage';
export { AWSDockerImagePackage, AWSDockerImageDeployment };
export {
  runTask,
  startTask,
  getLogs,
  StartTaskResult,
} from './apiDockerImageAws';

export const getConfig = (): AWSDockerImagePackage => {
  const packageConfig = new PackageConfig<
    AWSDockerImagePackage,
    AWSDockerImageDeployment
  >({
    packagePath: './',
  });
  return packageConfig.getConfig();
};

export const getDeployment = (
  deploymentName: string
): AWSDockerImageDeployment => {
  const packageConfig = new PackageConfig<
    AWSDockerImagePackage,
    AWSDockerImageDeployment
  >({
    packagePath: './',
  });
  const config = packageConfig.getConfig();
  return packageConfig.getDeployment(config, deploymentName);
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
      .command(
        'logs <taskId>',
        'Prints the logs for an image',
        (yargs: Argv<any>): Argv<any> => {
          return yargs.positional('taskId', {
            type: 'string',
            describe: 'Id of the tasks for which logs should be obtained.',
            demandOption: true,
          });
        }
      );
  };
};
export const run = async (args: string[]): Promise<void> => {
  await wrapCli(async () => {
    const argv = buildCli({
      yargs,
      deployCommands: buildDeployCommands(),
      infraCommands: infraCommands(),
    })
      .command('image', 'Commands for working with images.', imageCommands())
      .help().argv;

    const packageConfig = new PackageConfig<
      AWSDockerImagePackage,
      AWSDockerImageDeployment
    >({
      packagePath: './',
    });
    const config = packageConfig.getConfig();
    const command = argv._[0];

    const [, , , ...opArgs] = args;

    if (command === 'infra') {
      const deploymentName = opArgs[1];
      const deployment = packageConfig.getDeployment(config, deploymentName);
      await infraAwsDockerImageCli(config, deployment, opArgs);
      return;
    }

    if (command === 'deploy') {
      const deploymentName = opArgs[0];
      const deployment = packageConfig.getDeployment(config, deploymentName);
      await infraAwsDockerImageCli(config, deployment, ['deploy', ...opArgs]);
      return;
    }

    if (command === 'image') {
      const deploymentName = opArgs[1];
      const deployment = packageConfig.getDeployment(config, deploymentName);
      await apiDockerImageAwsCli(config, deployment, opArgs);
      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};

export class DockerImageAwsTemplate implements Template {
  getTemplateName(): string {
    return 'docker-image-aws';
  }
  getJsonSchema(): object {
    return configSchema;
  }
}
