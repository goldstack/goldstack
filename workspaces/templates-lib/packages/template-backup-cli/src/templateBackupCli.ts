import { wrapCli } from '@goldstack/utils-cli';
import { infraCommands } from '@goldstack/utils-terraform';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';
import yargs from 'yargs';

export const run = async (args: string[]): Promise<void> => {
  await wrapCli(async () => {
    const argv = await yargs
      .scriptName('template-backup')
      .usage('$0 <infra> <deployment>')
      .command(
        'infra <up|down|init|plan|apply|destroy|upgrade|terraform> <deployment>',
        'Manage infrastructure for deployment',
        infraCommands(),
      )
      .help()
      .parse();

    const command = argv._[0];

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
