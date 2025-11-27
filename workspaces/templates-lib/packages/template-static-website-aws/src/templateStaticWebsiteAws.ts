import { wrapCli } from '@goldstack/utils-cli';
import { fatal, warn } from '@goldstack/utils-log';
import { infraAwsStaticWebsiteCli } from './infraAwsStaticWebsite';
import type {
  AWSStaticWebsiteConfiguration,
  AWSStaticWebsiteDeployment,
  AWSStaticWebsiteDeploymentConfiguration,
  AWSStaticWebsitePackage,
} from './types/AWSStaticWebsitePackage';

export type {
  AWSStaticWebsitePackage,
  AWSStaticWebsiteConfiguration,
  AWSStaticWebsiteDeployment,
  AWSStaticWebsiteDeploymentConfiguration,
};

import { buildCli, buildDeployCommands } from '@goldstack/utils-package';
import { PackageConfig } from '@goldstack/utils-package-config';
import { infraCommands } from '@goldstack/utils-terraform';
import yargs from 'yargs';

export { infraAwsStaticWebsiteCli };

export const getDeploymentConfig = (deploymentName: string): AWSStaticWebsiteDeployment => {
  const packageConfig = new PackageConfig<AWSStaticWebsitePackage, AWSStaticWebsiteDeployment>({
    packagePath: './',
  });
  return packageConfig.getDeployment(deploymentName);
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

    const packageConfig = new PackageConfig<AWSStaticWebsitePackage, AWSStaticWebsiteDeployment>({
      packagePath: './',
    });

    const config = packageConfig.getConfig();
    const command = argv._[0];

    if (command === 'infra') {
      const infraOperation = argv._[1] as string;
      const deploymentName = argv.deployment;
      let targetVersion: string | undefined;
      let confirm: boolean | undefined;
      let commandArgs: string[] | undefined;

      if (infraOperation === 'upgrade') {
        targetVersion = argv.targetVersion;
      } else if (infraOperation === 'terraform') {
        commandArgs = argv.command;
      } else if (infraOperation === 'destroy') {
        confirm = argv.yes;
      }

      await infraAwsStaticWebsiteCli(config, [
        infraOperation,
        deploymentName,
        ...(targetVersion ? [targetVersion] : []),
        ...(commandArgs || []),
      ]);
      return;
    }

    if (command === 'deploy') {
      const deploymentName = argv.deployment;
      if (!packageConfig.hasDeployment(deploymentName)) {
        if (argv['ignore-missing-deployments']) {
          warn(
            `Deployment '${deploymentName}' does not exist. Skipping deploy due to --ignore-missing-deployments flag.`,
          );
          return;
        } else {
          throw new Error(`Cannot find configuration for deployment '${deploymentName}'`);
        }
      }
      await infraAwsStaticWebsiteCli(config, ['deploy', deploymentName]);
      return;
    }

    fatal('Unknown command: ' + command);
    throw new Error();
  });
};
