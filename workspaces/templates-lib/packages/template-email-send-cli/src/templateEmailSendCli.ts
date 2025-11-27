import type { EmailSendDeployment, EmailSendPackage } from '@goldstack/template-email-send';
import { wrapCli } from '@goldstack/utils-cli';
import { buildCli } from '@goldstack/utils-package';
import { PackageConfig } from '@goldstack/utils-package-config';
import { infraCommands } from '@goldstack/utils-terraform';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';
import yargs from 'yargs';

export const run = async (args: string[]): Promise<void> => {
  await wrapCli(async () => {
    const argv = await buildCli({
      yargs,
      deployCommands: (yargs) => yargs,
      infraCommands: infraCommands(),
    })
      .help()
      .parse();

    const packageConfig = new PackageConfig<EmailSendPackage, EmailSendDeployment>({
      packagePath: './',
    });
    const config = packageConfig.getConfig();
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
        command: commandArgs,
        ignoreMissingDeployments: argv['ignore-missing-deployments'] || false,
        skipConfirmations: argv.yes || false,
        options: undefined,
      });
      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};
