import { buildCli, buildDeployCommands } from '@goldstack/utils-package';
import { wrapCli } from '@goldstack/utils-cli';
import { infraCommands } from '@goldstack/utils-terraform';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';
import { PackageConfig } from '@goldstack/utils-package-config';
import type { DynamoDBPackage, DynamoDBDeployment } from '@goldstack/template-dynamodb';
import yargs, { type Argv } from 'yargs';
import assert from 'assert';
import { dynamoDBCli } from './dynamoDBTableCli';
import type { InputMigrations } from 'umzug/lib/types';
import type { DynamoDBContext } from '@goldstack/template-dynamodb';

export const run = async ({
  args,
  migrations,
}: {
  args: string[];
  migrations: InputMigrations<DynamoDBContext>;
}): Promise<void> => {
  await wrapCli(async () => {
    const deploymentPositional = (yargs: Argv<any>): Argv<any> => {
      return yargs.positional('deployment', {
        type: 'string',
        describe: 'Name of the deployment of the table',
        demandOption: true,
      });
    };
    const argv = await buildCli({
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
              deploymentPositional,
            )
            .command('delete', 'Deletes DynamoDB table and all its data', deploymentPositional)
            .command('migrate-to', 'Migrate DynamoDB table', (yargs) =>
              deploymentPositional(yargs).positional('migration-name', {
                type: 'string',
                describe: 'The name of the migration that the table should be migrated to.',
                demandOption: true,
              }),
            );
        },
      )
      .help()
      .parse();

    const packageConfig = new PackageConfig<DynamoDBPackage, DynamoDBDeployment>({
      packagePath: './',
    });
    const config = packageConfig.getConfig();
    assert(config, 'DynamoDB package config could not be loaded.');
    const command = argv._[0];
    const [, , , ...opArgs] = args;

    if (command === 'infra') {
      await dynamoDBCli(migrations, ['init', opArgs[1]]);
      await terraformAwsCli(opArgs);
      if (opArgs[0] === 'destroy') {
        await dynamoDBCli(migrations, ['delete', opArgs[1]]);
      }
      return;
    }

    if (command === 'deploy') {
      await dynamoDBCli(migrations, ['init', opArgs[0]]);
      return;
    }

    if (command === 'table') {
      await dynamoDBCli(migrations, opArgs);
      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};
