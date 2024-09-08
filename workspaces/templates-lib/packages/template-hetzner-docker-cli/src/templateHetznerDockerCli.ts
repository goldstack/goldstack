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
import { mkdir, write } from '@goldstack/utils-sh';
import { uploadCredentials } from './uploadCredentials';
import { updateCredentialsUrl, updateS3Bucket } from './initScriptUpdate';
import { createZip } from './createZip';

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

    if (command === 'infra') {
      await createZip();
      // use remote managed state from Terraform
      await terraformAwsCli(['create-state', opArgs[1]]);

      if (opArgs[0] === 'up' || opArgs[0] === 'apply') {
        await assertDeploymentsS3Bucket({
          packageConfig,
          deployment: opArgs[1],
        });

        if (!deployment.configuration.deploymentsS3Bucket) {
          throw new Error('Expected bucket to have been created');
        }
        updateS3Bucket(deployment.configuration.deploymentsS3Bucket);

        writePackageConfig(config);

        const userHash = crypto.randomBytes(6).toString('hex');
        deployment.configuration.vpsIAMUserName = `vps-${deployment.name}-${deployment.configuration.serverName}-${userHash}`;

        if (!deployment.configuration.deploymentsS3Bucket) {
          throw new Error('Cannot define IAM user since bucket not created.');
        }

        const vpsCredentials = await createUserWithReadOnlyS3Access({
          bucketName: deployment.configuration.deploymentsS3Bucket,
          deployment,
          vpsUserName: deployment.configuration.vpsIAMUserName,
        });

        mkdir('-p', './dist/credentials');
        write(
          JSON.stringify(vpsCredentials, null, 2),
          './dist/credentials/credentials'
        );

        const { url } = await uploadCredentials({ deployment });
        updateCredentialsUrl(url);
      }

      writePackageConfig(config);

      const { awsProvider } = await initTerraformEnvironment(opArgs);

      await uploadZip({
        deployment,
      });

      if (opArgs[0] === 'deploy') {
        updateCredentialsUrl('https://injectedurl.com');
        updateS3Bucket('injected-s3-bucket');
        return;
      }

      await terraformHetznerCli(opArgs, awsProvider);

      updateCredentialsUrl('https://injectedurl.com');
      updateS3Bucket('injected-s3-bucket');

      if (opArgs[0] === 'destroy') {
        if (deployment.configuration.vpsIAMUserName) {
          await deleteUserAndResources({
            deployment,
            vpsUserName: deployment.configuration.vpsIAMUserName,
          });
          deployment.configuration.vpsIAMUserName = undefined;
          writePackageConfig(config);
        }

        await deleteDeploymentsS3Bucket({
          packageConfig,
          deployment: opArgs[1],
        });
        deployment.configuration.deploymentsS3Bucket = undefined;
        writePackageConfig(config);
      }

      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};
