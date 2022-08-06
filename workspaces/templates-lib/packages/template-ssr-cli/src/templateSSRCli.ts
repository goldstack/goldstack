import { buildCli, buildDeployCommands } from '@goldstack/utils-package';
import { wrapCli } from '@goldstack/utils-cli';
import { infraCommands } from '@goldstack/utils-terraform';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';
import { PackageConfig } from '@goldstack/utils-package-config';
import { writePackageConfig } from '@goldstack/utils-package';
import yargs from 'yargs';
import fs from 'fs';
import {
  createLambdaAPIDeploymentConfiguration,
  SSRDeployment,
  SSRPackage,
} from '@goldstack/template-ssr';
import {
  readLambdaConfig,
  generateLambdaConfig,
  validateDeployment,
  buildFunctions,
  deployFunctions,
} from '@goldstack/utils-aws-lambda';
import { defaultRoutesPath } from './templateSSRConsts';
import { buildBundles } from './buildBundles';
import { deployToS3 } from './deployToS3';

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

    const packageConfig = new PackageConfig<SSRPackage, SSRDeployment>({
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
    config.deployments = config.deployments.map((e) => {
      const lambdasConfigs = generateLambdaConfig(
        createLambdaAPIDeploymentConfiguration(e.configuration),
        lambdaRoutes
      );
      e.configuration.lambdas = lambdasConfigs;
      validateDeployment(
        createLambdaAPIDeploymentConfiguration(e.configuration).lambdas
      );
      return e;
    });
    writePackageConfig(config);

    const command = argv._[0];
    const [, , , ...opArgs] = args;

    if (command === 'infra') {
      await terraformAwsCli(opArgs, {
        // temporary workaround for https://github.com/goldstack/goldstack/issues/40
        parallelism: 1,
      });
      return;
    }

    if (command === 'build') {
      const lambdaNamePrefix = packageConfig.getDeployment(opArgs[0])
        .configuration.lambdaNamePrefix;
      await buildFunctions({
        routesDir: defaultRoutesPath,
        configs: lambdaRoutes,
        lambdaNamePrefix,
      });
      await buildBundles({
        routesDir: defaultRoutesPath,
        configs: lambdaRoutes,
        lambdaNamePrefix,
      });
      return;
    }

    if (command === 'deploy') {
      await Promise.all([
        deployFunctions({
          routesPath: defaultRoutesPath,
          configuration: createLambdaAPIDeploymentConfiguration(
            packageConfig.getDeployment(opArgs[0]).configuration
          ),
          deployment: packageConfig.getDeployment(opArgs[0]),
          config: lambdaRoutes,
        }),
        deployToS3({
          configuration: createLambdaAPIDeploymentConfiguration(
            packageConfig.getDeployment(opArgs[0]).configuration
          ),
          deployment: packageConfig.getDeployment(opArgs[0]),
        }),
      ]);
      return;
    }

    throw new Error('Unknown command: ' + command);
  });
};
