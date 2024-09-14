import {
  buildCli,
  buildDeployCommands,
  writePackageConfig,
} from '@goldstack/utils-package';
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
  HetznerVPSPackage,
  HetznerVPSDeployment,
} from '@goldstack/template-hetzner-vps';
import yargs from 'yargs';
import { uploadZip } from './uploadZip';
import {
  assertAWSCredentials,
  assertAWSCredentials as createAccessKey,
  assertUserWithReadOnlyS3Access,
  deleteUserAndResources,
} from './awsCredentials';
export { createZip } from './createZip';

import { mkdir, rm, write } from '@goldstack/utils-sh';
import {
  generateCredentialsReadOnlyUrl,
  uploadCredentials,
} from './uploadCredentials';
import {
  updateCredentialsUrl as updateCredentialsUrlInCloudInit,
  updateS3Bucket as updateS3BucketInCloudInit,
} from './initScriptUpdate';
import { createZip } from './createZip';

import { logger } from '@goldstack/utils-cli';

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
      await createZip();

      await uploadCredentials({ deployment });
      await uploadZip({
        deployment,
      });
      logger().info(
        'Deployment to Hetzner VPS completed. Server should restart in a few seconds.'
      );
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

      if (infrastructureOp === 'up' || infrastructureOp === 'apply') {
        // Ensure S3 Bucket for deployments exist

        await assertDeploymentsS3Bucket({
          packageConfig,
          deployment: opArgs[1],
        });

        if (!deployment.configuration.deploymentsS3Bucket) {
          throw new Error('Expected bucket to have been created');
        }

        writePackageConfig(config);

        if (!deployment.configuration.deploymentsS3Bucket) {
          throw new Error('Cannot define IAM user since bucket not created.');
        }

        await assertUserWithReadOnlyS3Access({
          bucketName: deployment.configuration.deploymentsS3Bucket,
          deployment,
        });

        writePackageConfig(config);

        await assertAWSCredentials({
          deployment,
        });

        await uploadCredentials({ deployment });

        const url = await generateCredentialsReadOnlyUrl(deployment);
        updateCredentialsUrlInCloudInit(url);
        updateS3BucketInCloudInit(deployment.configuration.deploymentsS3Bucket);
        writePackageConfig(config);
      }

      writePackageConfig(config);

      if (infrastructureOp !== 'destroy') {
        await createZip();
        await uploadZip({
          deployment,
        });
      }

      const { awsProvider } = await initTerraformEnvironment(opArgs);
      await terraformHetznerCli(opArgs, awsProvider);

      updateCredentialsUrlInCloudInit('https://injectedurl.com');
      updateS3BucketInCloudInit('injected-s3-bucket');

      if (infrastructureOp === 'destroy') {
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

        rm('-f', './dist/credentials/credentials');
      }

      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};
