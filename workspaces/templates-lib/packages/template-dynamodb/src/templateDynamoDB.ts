import { buildCli, buildDeployCommands } from '@goldstack/utils-package';
import { wrapCli } from '@goldstack/utils-cli';
import { infraCommands } from '@goldstack/utils-terraform';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';
export * from './types/DynamoDBPackage';
export * from './templateDynamoDBTable';
export type { DynamoDBContext } from './dynamoDBMigrations';
import { PackageConfig } from '@goldstack/utils-package-config';
import { DynamoDBPackage, DynamoDBDeployment } from './types/DynamoDBPackage';
import yargs, { Argv } from 'yargs';
import assert from 'assert';
import { dynamoDBCli } from './dynamoDBTableCli';

export const run = async (args: string[]): Promise<void> => {
  await wrapCli(async () => {
    const deploymentPositional = (yargs: Argv<any>): Argv<any> => {
      return yargs.positional('deployment', {
        type: 'string',
        describe: 'Name of the deployment of the table',
        demandOption: true,
      });
    };
    const argv = buildCli({
      yargs,
      deployCommands: buildDeployCommands(),
      infraCommands: infraCommands(),
    })
      .usage('$0 <table>')
      .command(
        'table <init|delete|migrate-to> <deployment>',
        'Utility commands for DynamoDB table',
        (yargs) => {
          yargs
            .command(
              'init',
              'Initialise DynamoDB table and run all applicable migrations',
              deploymentPositional
            )
            .command(
              'delete',
              'Deletes DynamoDB table and all its data',
              deploymentPositional
            )
            .command('migrate-to', 'Migrate DynamoDB table', (yargs) =>
              deploymentPositional(yargs).positional('migration-name', {
                type: 'string',
                describe:
                  'The name of the migration that the table should be migrated to.',
                demandOption: true,
              })
            );
        }
      )
      .help().argv;

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
      if (opArgs[0] === 'up') {
        await dynamoDBCli(['init', opArgs[1]]);
      }
      await terraformAwsCli(opArgs);
      if (opArgs[0] === 'destroy') {
        await dynamoDBCli(['delete', opArgs[1]]);
      }
      return;
    }

    if (command === 'deploy') {
      await dynamoDBCli(['init', opArgs[0]]);
      return;
    }

    if (command === 'table') {
      await dynamoDBCli(opArgs);
      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};
