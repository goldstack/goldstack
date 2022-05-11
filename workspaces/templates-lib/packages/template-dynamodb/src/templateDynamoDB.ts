import { buildCli, buildDeployCommands } from '@goldstack/utils-package';
import { wrapCli } from '@goldstack/utils-cli';
import { infraCommands } from '@goldstack/utils-terraform';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';
export * from './types/DynamoDBPackage';
export * from './templateDynamoDBTable';
import { PackageConfig } from '@goldstack/utils-package-config';
import { DynamoDBPackage, DynamoDBDeployment } from './types/DynamoDBPackage';
import yargs from 'yargs';
import assert from 'assert';

export const run = async (args: string[]): Promise<void> => {
  await wrapCli(async () => {
    const argv = buildCli({
      yargs,
      deployCommands: buildDeployCommands(),
      infraCommands: infraCommands(),
    }).help().argv;

    const packageConfig = new PackageConfig<
      DynamoDBPackage,
      DynamoDBDeployment
    >({
      packagePath: './',
    });
    const config = packageConfig.getConfig();
    assert(config, 'DynamoDB package config could not be loaded.');
    const command = argv._[0];
    const [, , , ...opArgs] = args;

    if (command === 'infra') {
      await terraformAwsCli(opArgs);
      return;
    }

    if (command === 'deploy') {
      throw new Error('Deploy not supported for DynamoDB template');
      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};
