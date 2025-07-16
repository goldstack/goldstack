import { buildCli, buildDeployCommands } from '@goldstack/utils-package';
import { wrapCli } from '@goldstack/utils-cli';
import { infraCommands } from '@goldstack/utils-terraform';
import { deployCli } from './templateUserManagementDeploy';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';
import { PackageConfig } from '@goldstack/utils-package-config';
import type {
  UserManagementPackage,
  UserManagementDeployment,
} from '@goldstack/template-user-management';
import yargs from 'yargs';

export const run = async (args: string[]): Promise<void> => {
  await wrapCli(async () => {
    const argv = await buildCli({
      yargs,
      deployCommands: buildDeployCommands(),
      infraCommands: infraCommands(),
    })
      .help()
      .parse();

    const packageConfig = new PackageConfig<
      UserManagementPackage,
      UserManagementDeployment
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

    if (command === 'deploy') {
      await deployCli(config, packageConfig.getDeployment(opArgs[0]));
      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};
