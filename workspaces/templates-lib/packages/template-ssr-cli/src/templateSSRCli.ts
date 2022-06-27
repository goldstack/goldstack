import { buildCli, buildDeployCommands } from '@goldstack/utils-package';
import { wrapCli } from '@goldstack/utils-cli';
import { infraCommands } from '@goldstack/utils-terraform';
import { deployCli } from './templateS3Deploy';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';
import { PackageConfig } from '@goldstack/utils-package-config';
import yargs from 'yargs';
import { SSRDeployment, SSRPackage } from '@goldstack/template-ssr';

export const run = async (args: string[]): Promise<void> => {
  await wrapCli(async () => {
    const argv = await buildCli({
      yargs,
      deployCommands: buildDeployCommands(),
      infraCommands: infraCommands(),
    })
      .help()
      .parse();

    const packageConfig = new PackageConfig<SSRPackage, SSRDeployment>({
      packagePath: './',
    });
    const config = packageConfig.getConfig();
    const command = argv._[0];
    const [, , , ...opArgs] = args;

    if (command === 'infra') {
      await terraformAwsCli(opArgs);
      return;
    }

    if (command === 'deploy') {
      await deployCli(config, ['deploy', ...opArgs]);
      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};
