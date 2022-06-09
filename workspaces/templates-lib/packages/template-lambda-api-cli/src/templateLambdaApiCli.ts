import { buildCli, buildDeployCommands } from '@goldstack/utils-package';
import { wrapCli } from '@goldstack/utils-cli';
import { infraCommands } from '@goldstack/utils-terraform';
import { deployCli } from './templateLambdaApiDeploy';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';
import { PackageConfig } from '@goldstack/utils-package-config';
import { writePackageConfig } from '@goldstack/utils-package';
import yargs from 'yargs';
import fs from 'fs';
import {
  LambdaApiPackage,
  LambdaApiDeployment,
} from '@goldstack/template-lambda-api';
import { readLambdaConfig } from '@goldstack/utils-aws-lambda';
import {
  generateLambdaConfig,
  validateDeployment,
} from './generateLambdaConfig';
import { defaultRoutesPath } from './templateLambdaConsts';
import { buildLambdas } from './templateLambdaApiBuild';

export const run = async (args: string[]): Promise<void> => {
  await wrapCli(async () => {
    const argv = await buildCli({
      yargs,
      deployCommands: buildDeployCommands(),
      infraCommands: infraCommands(),
    })
      .command('build [deployment]', 'Build all lambdas', () => {
        return yargs.positional('deployment', {
          type: 'string',
          describe: 'Name of the deployment this command should be applied to',
          default: '',
        });
      })
      .help()
      .parse();

    const packageConfig = new PackageConfig<
      LambdaApiPackage,
      LambdaApiDeployment
    >({
      packagePath: './',
    });

    const config = packageConfig.getConfig();

    // update routes
    if (!fs.existsSync('./src/routes')) {
      throw new Error(
        'Please specify lambda function handlers in ./src/routes so that API Gateway route configuration can be generated.'
      );
    }
    const lambdaRoutes = readLambdaConfig(defaultRoutesPath);
    config.deployments = config.deployments.map((e) => {
      const lambdasConfigs = generateLambdaConfig(e, lambdaRoutes);
      e.configuration.lambdas = lambdasConfigs;
      validateDeployment(e.configuration.lambdas);
      return e;
    });
    writePackageConfig(config);

    const command = argv._[0];
    const [, , , ...opArgs] = args;

    if (command === 'infra') {
      await terraformAwsCli(opArgs);
      return;
    }

    if (command === 'build') {
      await buildLambdas({
        routesDir: defaultRoutesPath,
        configs: lambdaRoutes,
        lambdaNamePrefix: packageConfig.getDeployment(opArgs[0]).configuration
          .lambdaNamePrefix,
      });
      return;
    }

    if (command === 'deploy') {
      await deployCli(packageConfig.getDeployment(opArgs[0]), lambdaRoutes);
      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};
