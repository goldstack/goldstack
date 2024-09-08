import { buildCli } from '@goldstack/utils-package';
import { wrapCli } from '@goldstack/utils-cli';
import { infraCommands } from '@goldstack/utils-terraform';
import {
  terraformAwsCli,
  initTerraformEnvironment,
} from '@goldstack/utils-terraform-aws';
import { terraformHetznerCli } from '@goldstack/utils-terraform-hetzner';
import { PackageConfig } from '@goldstack/utils-package-config';
import {
  HetznerDockerPackage,
  HetznerDockerDeployment,
} from '@goldstack/template-hetzner-docker';
import yargs from 'yargs';
export { createZip } from './fileUpload';

export const run = async (args: string[]): Promise<void> => {
  await wrapCli(async () => {
    const argv = await buildCli({
      yargs,
      deployCommands: (yargs) => yargs,
      infraCommands: infraCommands(),
    })
      .help()
      .parse();

    const packageConfig = new PackageConfig<
      HetznerDockerPackage,
      HetznerDockerDeployment
    >({
      packagePath: './',
    });
    const config = packageConfig.getConfig();
    const command = argv._[0];
    const [, , , ...opArgs] = args;


    if (command === 'infra') {
      // use remote managed state from Terraform
      await terraformAwsCli(['create-state', opArgs[1]]);

      const { awsProvider } = await initTerraformEnvironment(opArgs);

      await terraformHetznerCli(opArgs, awsProvider);

      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};
