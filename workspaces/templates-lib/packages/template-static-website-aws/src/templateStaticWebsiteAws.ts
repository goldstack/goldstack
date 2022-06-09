import { wrapCli } from '@goldstack/utils-cli';
import { fatal } from '@goldstack/utils-log';
import { infraAwsStaticWebsiteCli } from './infraAwsStaticWebsite';
import {
  AWSStaticWebsiteConfiguration,
  AWSStaticWebsitePackage,
  AWSStaticWebsiteDeploymentConfiguration,
} from './types/AWSStaticWebsitePackage';
import { AWSStaticWebsiteDeployment } from './types/AWSStaticWebsitePackage';

export type {
  AWSStaticWebsitePackage,
  AWSStaticWebsiteConfiguration,
  AWSStaticWebsiteDeployment,
  AWSStaticWebsiteDeploymentConfiguration,
};

import { PackageConfig } from '@goldstack/utils-package-config';
import yargs from 'yargs';
import { buildCli, buildDeployCommands } from '@goldstack/utils-package';
import { infraCommands } from '@goldstack/utils-terraform';

export { infraAwsStaticWebsiteCli };

export const getDeploymentConfig = (
  deploymentName: string
): AWSStaticWebsiteDeployment => {
  const packageConfig = new PackageConfig<
    AWSStaticWebsitePackage,
    AWSStaticWebsiteDeployment
  >({
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

    const packageConfig = new PackageConfig<
      AWSStaticWebsitePackage,
      AWSStaticWebsiteDeployment
    >({
      packagePath: './',
    });

    const config = packageConfig.getConfig();
    const command = argv._[0];
    const [, , , ...opArgs] = args;

    if (command === 'infra') {
      await infraAwsStaticWebsiteCli(config, opArgs);
      return;
    }

    if (command === 'deploy') {
      await infraAwsStaticWebsiteCli(config, ['deploy', ...opArgs]);
      return;
    }

    fatal('Unknown command: ' + command);
    throw new Error();
  });
};
