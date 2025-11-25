import type { LambdaApiDeployment, LambdaApiPackage } from '@goldstack/template-lambda-api';
import {
  buildFunctions,
  defaultBuildOptions,
  deployFunctions,
  generateLambdaConfig,
  readLambdaConfig,
  validateDeployment,
} from '@goldstack/utils-aws-lambda';
import { wrapCli } from '@goldstack/utils-cli';
import { debug, warn } from '@goldstack/utils-log';
import { buildCli, buildDeployCommands, writePackageConfig } from '@goldstack/utils-package';
import { PackageConfig } from '@goldstack/utils-package-config';
import { pwd } from '@goldstack/utils-sh';
import { infraCommands } from '@goldstack/utils-terraform';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';
import fs from 'fs';
import outmatch from 'outmatch';
import yargs from 'yargs';
import { defaultRoutesPath } from './templateLambdaConsts';

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
      .option('ignore-missing-deployments', {
        type: 'boolean',
        describe: 'Ignore missing deployments',
        default: false,
      })
      .help()
      .parse();

    const packageConfig = new PackageConfig<LambdaApiPackage, LambdaApiDeployment>({
      packagePath: './',
    });

    const config = packageConfig.getConfig();

    // update routes
    if (!fs.existsSync(defaultRoutesPath)) {
      throw new Error(
        `Please specify lambda function handlers in ${defaultRoutesPath} so that API Gateway route configuration can be generated.`,
      );
    }
    const lambdaRoutes = readLambdaConfig(defaultRoutesPath);

    let filteredLambdaRoutes = lambdaRoutes;
    config.deployments = config.deployments.map((e) => {
      const lambdasConfigs = generateLambdaConfig(e.configuration, filteredLambdaRoutes);
      e.configuration.lambdas = lambdasConfigs;
      validateDeployment(e.configuration.lambdas);
      return e;
    });
    writePackageConfig(config);

    const command = argv._[0] as string;
    const deploymentName = argv._[1] as string;
    const routeFilterArg = argv._[2] ? (argv._[2] as string) : undefined;
    const routeFilter = routeFilterArg ? `*${routeFilterArg}*` : undefined;

    if (routeFilter && (command === 'build' || command === 'deploy')) {
      filteredLambdaRoutes = filteredLambdaRoutes.filter((el) => {
        const result =
          outmatch(`**/*${routeFilterArg}*`)(el.relativeFilePath) ||
          outmatch(`**/*${routeFilterArg}*/*`)(el.relativeFilePath);
        debug(
          `Filtering lambdas. Testing: ${
            el.relativeFilePath
          } to match ${routeFilter}. Result: ${result}`,
        );
        return result;
      });
      if (filteredLambdaRoutes.length === 0) {
        warn(
          `Cannot perform command '${command}'. No routes match supplied filter ${routeFilterArg}.`,
        );
        return;
      }
      // console.log(filteredLambdaRoutes);
    }

    if (command === 'infra') {
      await terraformAwsCli(argv._.slice(1) as string[], {
        // temporary workaround for https://github.com/goldstack/goldstack/issues/40
        parallelism: 1,
      });
      return;
    }

    if (command === 'build') {
      if (argv.ignoreMissingDeployments && !packageConfig.hasDeployment(deploymentName)) {
        warn(`Deployment '${deploymentName}' does not exist. Skipping build.`);
        return;
      }
      const deployment = packageConfig.getDeployment(deploymentName);
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
      if (!packageConfig.hasDeployment(deploymentName)) {
        if (argv.ignoreMissingDeployments) {
          warn(
            `Deployment '${deploymentName}' does not exist. Skipping deploy due to --ignore-missing-deployments flag.`,
          );
          return;
        } else {
          throw new Error(`Cannot find configuration for deployment '${deploymentName}'`);
        }
      }
      await deployFunctions({
        routesPath: defaultRoutesPath,
        configuration: packageConfig.getDeployment(deploymentName).configuration,
        deployment: packageConfig.getDeployment(deploymentName),
        config: filteredLambdaRoutes,
        packageRootFolder: pwd(),
      });
      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};
