import { buildCli } from '@goldstack/utils-package';
import { wrapCli } from '@goldstack/utils-cli';

import {
  assertDeploymentsS3Bucket,
  deleteDeploymentsS3Bucket,
} from './deploymentsS3Bucket';

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
import { uploadZip } from './uploadZip';
export { createZip } from './createZip';

export const run = async (args: string[]): Promise<void> => {
  await wrapCli(async () => {
    const argv = await buildCli({
      yargs,
      deployCommands: (yargs) => yargs,
      infraCommands: infraCommands(),
    })
      .command('deploy [deployment]', 'Deploy files to server', () => {
        return yargs.positional('deployment', {
          type: 'string',
          describe:
            'Name of the deployment that the server files should be deployed to',
          default: '',
        });
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

    if (command === 'deploy') {
      await uploadZip({
        deployment: packageConfig.getDeployment(opArgs[1]),
      });
    }

    if (command === 'infra') {
      // use remote managed state from Terraform
      await terraformAwsCli(['create-state', opArgs[1]]);

      await assertDeploymentsS3Bucket({
        packageConfig,
        deployment: opArgs[1],
      });
      const { awsProvider } = await initTerraformEnvironment(opArgs);

      await terraformHetznerCli(opArgs, awsProvider);

      if (opArgs[0] === 'destroy') {
        await deleteDeploymentsS3Bucket({
          packageConfig,
          deployment: opArgs[1],
        });
      }

      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};
