import { buildCli, buildDeployCommands } from '@goldstack/utils-package';
import { wrapCli } from '@goldstack/utils-cli';

import { infraCommands } from '@goldstack/utils-terraform';
import {
  terraformAwsCli,
  initTerraformEnvironment,
} from '@goldstack/utils-terraform-aws';
import { terraformHetznerCli } from '@goldstack/utils-terraform-hetzner';
import { PackageConfig } from '@goldstack/utils-package-config';
import {
  HetznerVPSPackage,
  HetznerVPSDeployment,
} from '@goldstack/template-hetzner-vps';
import yargs from 'yargs';

import { logger } from '@goldstack/utils-cli';
import { sshDeploy } from './sshDeploy';

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
      HetznerVPSPackage,
      HetznerVPSDeployment
    >({
      packagePath: './',
    });
    const config = packageConfig.getConfig();
    const command = argv._[0];
    const [, , , ...opArgs] = args;

    if (command === 'deploy') {
      logger().info('Starting deployment to Hetzner VPS.');
      const deployment = packageConfig.getDeployment(opArgs[0]);
      await sshDeploy(deployment);
      return;
    }

    if (command === 'infra') {
      const deployment = packageConfig.getDeployment(opArgs[1]);
      const infrastructureOp = opArgs[0];
      logger().info(
        `Running infrastructure operation ${infrastructureOp} for ${deployment.name}`
      );
      // use remote managed state from Terraform
      await terraformAwsCli(['create-state', opArgs[1]]);

      const { awsProvider } = await initTerraformEnvironment(opArgs);
      await terraformHetznerCli(opArgs, awsProvider);

      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};
