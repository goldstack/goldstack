import { buildCli, writePackageConfig } from '@goldstack/utils-package';
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
import {
  createUserWithReadOnlyS3Access,
  deleteUserAndResources,
} from './awsCredentials';
export { createZip } from './createZip';

import crypto from 'crypto';

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

    const deployment = packageConfig.getDeployment(opArgs[1]);

    if (command === 'deploy') {
      await uploadZip({
        deployment,
      });
    }

    if (command === 'infra') {
      // use remote managed state from Terraform
      await terraformAwsCli(['create-state', opArgs[1]]);

      await assertDeploymentsS3Bucket({
        packageConfig,
        deployment: opArgs[1],
      });

      if (!deployment.configuration.vpsIAMUserName) {
        const userHash = crypto.randomBytes(6).toString('hex');
        deployment.configuration.vpsIAMUserName = `vps-${deployment.name}-${deployment.configuration.serverName}-${userHash}`;

        if (!deployment.configuration.deploymentsS3Bucket) {
          throw new Error('Cannot define IAM user since bucket not created.');
        }

        await createUserWithReadOnlyS3Access({
          bucketName: deployment.configuration.deploymentsS3Bucket,
          deployment,
          vpsUserName: deployment.configuration.vpsIAMUserName,
        });
      }

      writePackageConfig(config);

      writePackageConfig(config);

      const { awsProvider } = await initTerraformEnvironment(opArgs);

      await terraformHetznerCli(opArgs, awsProvider);

      if (opArgs[0] === 'destroy') {
        if (deployment.configuration.vpsIAMUserName) {
          await deleteUserAndResources({
            deployment,
            vpsUserName: deployment.configuration.vpsIAMUserName,
          });
        }

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
