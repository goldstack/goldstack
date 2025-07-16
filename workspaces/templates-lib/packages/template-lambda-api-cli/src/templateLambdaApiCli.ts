import { buildCli, buildDeployCommands } from '@goldstack/utils-package';
import { wrapCli } from '@goldstack/utils-cli';
import { infraCommands } from '@goldstack/utils-terraform';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';
import { PackageConfig } from '@goldstack/utils-package-config';
import { writePackageConfig } from '@goldstack/utils-package';
import yargs from 'yargs';
import fs from 'fs';
import type {
  LambdaApiPackage,
  LambdaApiDeployment,
} from '@goldstack/template-lambda-api';
import {
  readLambdaConfig,
  generateLambdaConfig,
  validateDeployment,
  buildFunctions,
  deployFunctions,
  defaultBuildOptions,
} from '@goldstack/utils-aws-lambda';
import { defaultRoutesPath } from './templateLambdaConsts';
import outmatch from 'outmatch';
import { pwd } from '@goldstack/utils-sh';
import { debug, warn } from '@goldstack/utils-log';

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
    if (!fs.existsSync(defaultRoutesPath)) {
      throw new Error(
        `Please specify lambda function handlers in ${defaultRoutesPath} so that API Gateway route configuration can be generated.`
      );
    }
    const lambdaRoutes = readLambdaConfig(defaultRoutesPath);

    let filteredLambdaRoutes = lambdaRoutes;
    config.deployments = config.deployments.map((e) => {
      const lambdasConfigs = generateLambdaConfig(
        e.configuration,
        filteredLambdaRoutes
      );
      e.configuration.lambdas = lambdasConfigs;
      validateDeployment(e.configuration.lambdas);
      return e;
    });
    writePackageConfig(config);

    const command = argv._[0];
    const [, , , ...opArgs] = args;

    if (command === 'build' || command === 'deploy') {
      if (opArgs.length === 2) {
        filteredLambdaRoutes = filteredLambdaRoutes.filter((el) => {
          const result =
            outmatch(`**/*${opArgs[1]}*`)(el.relativeFilePath) ||
            outmatch(`**/*${opArgs[1]}*/*`)(el.relativeFilePath);
          debug(
            `Filtering lambdas. Testing: ${
              el.relativeFilePath
            } to match ${`*${opArgs[1]}*`}. Result: ${result}`
          );
          return result;
        });
        if (filteredLambdaRoutes.length === 0) {
          warn(
            `Cannot perform command '${command}'. No routes match supplied filter ${opArgs[1]}.`
          );
          return;
        }
        // console.log(filteredLambdaRoutes);
      }
    }

    if (command === 'infra') {
      await terraformAwsCli(opArgs, {
        // temporary workaround for https://github.com/goldstack/goldstack/issues/40
        parallelism: 1,
      });
      return;
    }

    if (command === 'build') {
      const deployment = packageConfig.getDeployment(opArgs[0]);
      let routeFilter: undefined | string ;
      if (opArgs.length === 2) {
        routeFilter = `*${opArgs[1]}*`;
      }
      await buildFunctions({
        routesDir: defaultRoutesPath,
        buildOptions: defaultBuildOptions(),
        deploymentName: deployment.name,
        configs: filteredLambdaRoutes,
        routeFilter,
        lambdaNamePrefix: deployment.configuration.lambdaNamePrefix || '',
        packageRootDir: pwd(),
      });
      return;
    }

    if (command === 'deploy') {
      await deployFunctions({
        routesPath: defaultRoutesPath,
        configuration: packageConfig.getDeployment(opArgs[0]).configuration,
        deployment: packageConfig.getDeployment(opArgs[0]),
        config: filteredLambdaRoutes,
        packageRootFolder: pwd(),
      });
      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};
