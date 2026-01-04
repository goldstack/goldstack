import type {
  DynamoDBContext,
  DynamoDBDeployment,
  DynamoDBPackage,
} from '@goldstack/template-dynamodb';
import { wrapCli } from '@goldstack/utils-cli';
import { warn } from '@goldstack/utils-log';
import { buildCli, buildDeployCommands } from '@goldstack/utils-package';
import { PackageConfig } from '@goldstack/utils-package-config';
import { infraCommands } from '@goldstack/utils-terraform';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';
import assert from 'assert';
import type { InputMigrations } from 'umzug/lib/types';
import yargs, { type Argv } from 'yargs';
import { dynamoDBCli } from './dynamoDBTableCli';

export * from './gsiMigrationUtils';

export const run = async ({
  args,
  migrations,
}: {
  args: string[];
  migrations: InputMigrations<DynamoDBContext>;
}): Promise<void> => {
  await wrapCli(async () => {
    // biome-ignore lint/suspicious/noExplicitAny: yargs command definition
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
      const deploymentName = argv.deployment;
      if (!packageConfig.hasDeployment(deploymentName)) {
        if (argv['ignore-missing-deployments']) {
          warn(
            `Deployment '${deploymentName}' does not exist. Skipping infra due to --ignore-missing-deployments flag.`,
          );
          return;
        } else {
          throw new Error(`Cannot find configuration for deployment '${deploymentName}'`);
        }
      }
      const infraOperation = argv._[1] as string;
      if (infraOperation !== 'destroy') {
        await dynamoDBCli(migrations, ['init', deploymentName]);
      }
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
      if (infraOperation === 'destroy') {
        await dynamoDBCli(migrations, ['delete', deploymentName]);
      }
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
      await dynamoDBCli(migrations, ['init', deploymentName]);
      return;
    }

    if (command === 'table') {
      await dynamoDBCli(migrations, opArgs);
      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};
