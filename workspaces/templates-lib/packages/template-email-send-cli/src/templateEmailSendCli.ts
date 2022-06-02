import { buildCli } from '@goldstack/utils-package';
import { wrapCli } from '@goldstack/utils-cli';
import { infraCommands } from '@goldstack/utils-terraform';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';
import { PackageConfig } from '@goldstack/utils-package-config';
import {
  EmailSendPackage,
  EmailSendDeployment,
} from '@goldstack/template-email-send';
import yargs from 'yargs';

export const run = async (args: string[]): Promise<void> => {
  await wrapCli(async () => {
    const argv = buildCli({
      yargs,
      deployCommands: (yargs) => yargs,
      infraCommands: infraCommands(),
    }).help().argv;

    const packageConfig = new PackageConfig<
      EmailSendPackage,
      EmailSendDeployment
    >({
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
