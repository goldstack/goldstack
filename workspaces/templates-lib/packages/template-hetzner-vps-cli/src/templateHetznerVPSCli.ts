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

import { info } from '@goldstack/utils-log';
import { build, sshDeploy } from './sshDeploy';

export const buildZip = async (): Promise<void> => {
  const args = process.argv.slice(2); // Skip the first two default args (node and script path)
  const deploymentName = args[0]; // The first argument after `yarn build` will be `prod` if passed

  const packageConfig = new PackageConfig<
    HetznerVPSPackage,
    HetznerVPSDeployment
  >({
    packagePath: './',
  });
  const deployment = packageConfig.getDeployment(deploymentName);
  await build(deployment);
};

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
      info('Starting deployment to Hetzner VPS.');
      const deployment = packageConfig.getDeployment(opArgs[0]);
      await build(deployment);
      await sshDeploy(deployment);
      return;
    }

    if (command === 'infra') {
      const deployment = packageConfig.getDeployment(opArgs[1]);
      const infrastructureOp = opArgs[0];
      info(
        `Running infrastructure operation ${infrastructureOp} for ${deployment.name}`
      );
      // use remote managed state from Terraform
      await terraformAwsCli(['create-state', opArgs[1]]);

      if (infrastructureOp === 'destroy-state') {
        await terraformAwsCli(['destroy-state', opArgs[1]]);
        return;
      }

      const { awsProvider } = await initTerraformEnvironment(opArgs);
      await terraformHetznerCli(opArgs, awsProvider);

      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};
