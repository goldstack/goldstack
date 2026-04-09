import { cleanupVault } from '@goldstack/template-backup-cli';
import { wrapCli } from '@goldstack/utils-cli';
import { infraCommands } from '@goldstack/utils-terraform';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';
import yargs from 'yargs';

export { configureCrossAccount } from './configureCrossAccount';

export const run = async (args: string[]): Promise<void> => {
  await wrapCli(async () => {
    const argv = await yargs
      .scriptName('template-backup-central')
      .usage('$0 <command>')
      .command(
        'infra <up|down|init|plan|apply|destroy|upgrade|terraform> <deployment>',
        'Manage infrastructure for deployment',
        infraCommands(),
      )
      .command(
        'cleanup-vault <deployment>',
        'Clean up backup vault by stopping jobs and deleting recovery points before destroy',
        (yargs) => {
          return yargs
            .positional('deployment', {
              type: 'string',
              describe: 'Name of the deployment',
              demandOption: true,
            })
            .option('yes', {
              alias: 'y',
              description: 'Skip confirmation prompt',
              type: 'boolean',
              default: false,
            });
        },
      )
      .command(
        'configure-cross-account <deployment>',
        'Configure cross-account settings by discovering backup packages and updating configuration',
        (yargs) => {
          return yargs
            .positional('deployment', {
              type: 'string',
              describe: 'Name of the deployment',
              demandOption: true,
            })
            .option('target-package', {
              type: 'string',
              describe: 'Target backup package pattern to match (replaces auto-discovery)',
            });
        },
      )
      .help()
      .parse();

    const command = argv._[0];

    if (command === 'cleanup-vault') {
      await cleanupVault({
        deploymentName: argv.deployment as string,
        confirm: argv.yes as boolean | undefined,
      });
      return;
    }

    if (command === 'configure-cross-account') {
      const { configureCrossAccount } = await import('./configureCrossAccount');
      await configureCrossAccount({
        deploymentName: argv.deployment as string,
        targetPackage: argv['target-package'] as string | undefined,
      });
      return;
    }

    if (command === 'infra') {
      const infraOperation = argv._[1] as string;
      const deploymentName = argv.deployment as string;
      let targetVersion: string | undefined;
      let confirm: boolean | undefined;
      let commandArgs: string[] | undefined;

      if (infraOperation === 'upgrade') {
        targetVersion = argv.targetVersion as string | undefined;
      } else if (infraOperation === 'terraform') {
        commandArgs = args.slice(3);
      } else if (infraOperation === 'destroy') {
        confirm = argv.yes as boolean | undefined;
      }

      await terraformAwsCli({
        infraOperation,
        deploymentName,
        targetVersion,
        confirm,
        commandArguments: commandArgs,
        ignoreMissingDeployments: (argv['ignore-missing-deployments'] as boolean) || false,
        skipConfirmations: (argv.yes as boolean) || false,
        options: undefined,
      });
      return;
    }

    throw new Error(`Unknown command: ${command}`);
  });
};
