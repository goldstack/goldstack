import { buildCli, buildDeployCommands } from '@goldstack/utils-package';
import { wrapCli } from '@goldstack/utils-cli';
import { infraCommands } from '@goldstack/utils-terraform';
import { deployLambda } from '@goldstack/template-lambda-cli';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';
import { PackageConfig } from '@goldstack/utils-package-config';
export * from './types/LambdaHttpPackage';
import yargs from 'yargs';
import {
  LambdaExpressPackage,
  LambdaExpressDeployment,
} from './types/LambdaHttpPackage';

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
      LambdaExpressPackage,
      LambdaExpressDeployment
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
      await deployLambda(packageConfig.getDeployment(opArgs[0]));
      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};
