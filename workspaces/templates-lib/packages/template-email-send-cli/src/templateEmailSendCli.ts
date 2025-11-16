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
    const command = argv._[0];
    const [, , , ...opArgs] = args;

    if (command === 'infra') {
      await terraformAwsCli(opArgs);
      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};
