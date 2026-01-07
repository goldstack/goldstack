import { readDeploymentState, readTerraformStateVariable } from '@goldstack/infra';
import type { BuildConfiguration } from '@goldstack/template-ssr';
import {
  createLambdaAPIDeploymentConfiguration,
  type SSRDeployment,
  type SSRPackage,
} from '@goldstack/template-ssr';
import {
  buildFunctions,
  deployFunctions,
  generateLambdaConfig,
  type LambdaConfig,
  readLambdaConfig,
  validateDeployment,
} from '@goldstack/utils-aws-lambda';
import { wrapCli } from '@goldstack/utils-cli';
import { warn } from '@goldstack/utils-log';
import { writePackageConfig } from '@goldstack/utils-package';
import { PackageConfig } from '@goldstack/utils-package-config';
import { pwd } from '@goldstack/utils-sh';
import { infraCommands } from '@goldstack/utils-terraform';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';
import fs from 'fs';
import outmatch from 'outmatch';
import yargs, { type Argv } from 'yargs';
import { buildBundles } from './buildBundles';
import { deployToS3 } from './deployToS3';
import { defaultRoutesPath } from './templateSSRConsts';

export const run = async (args: string[], buildConfig: BuildConfiguration): Promise<void> => {
  await wrapCli(async () => {
    const argv = await yargs
      .scriptName('template')
      .usage('$0 <infra|build|deploy>')
      .command(
        'infra <up|down|init|plan|apply|destroy|upgrade|terraform> <deployment>',
        'Manage infrastructure for deployment',
        infraCommands(),
      )
      .command(
        'build <deployment> [route]',
        'Build deployment packages',
        // biome-ignore lint/suspicious/noExplicitAny: yargs command definition
        (yargs: Argv<any>): Argv<any> => {
          return yargs
            .positional('deployment', {
              description: 'Name of the deployment where the package should be deployed to.',
              type: 'string',
              demandOption: true,
            })
            .positional('route', {
              type: 'string',
              demandOption: false,
              description: 'A glob filter to select specific routes for deployment',
            });
        },
      )
      .command(
        'deploy <deployment> [route]',
        'Deploy to specified deployment',
        // biome-ignore lint/suspicious/noExplicitAny: yargs command definition
        (yargs: Argv<any>): Argv<any> => {
          return yargs
            .positional('deployment', {
              description: 'Name of the deployment where the package should be deployed to.',
              type: 'string',
              demandOption: true,
            })
            .positional('route', {
              type: 'string',
              demandOption: false,
              description: 'A glob filter to select specific routes for deployment',
            });
        },
      )
      .option('ignore-missing-deployments', {
        type: 'boolean',
        describe: 'Ignore missing deployments',
        default: false,
      })
      .help()
      .parse();

    const { config, lambdaRoutes, packageConfig } = readFunctionConfig();

    let filteredLambdaRoutes = lambdaRoutes;
    config.deployments = config.deployments.map((e) => {
      const lambdasConfigs = generateLambdaConfig(
        createLambdaAPIDeploymentConfiguration(e.configuration),
        filteredLambdaRoutes,
      );
      e.configuration.lambdas = lambdasConfigs;
      validateDeployment(createLambdaAPIDeploymentConfiguration(e.configuration).lambdas);
      return e;
    });
    writePackageConfig(config);

    const [, , , ...opArgs] = args;
    const command = argv._[0];

    if (command === 'build' || command === 'deploy') {
      if (argv.route) {
        filteredLambdaRoutes = filteredLambdaRoutes.filter(
          (el) =>
            outmatch(`**/*${argv.route}*`)(el.relativeFilePath) ||
            outmatch(`**/*${argv.route}*/*`)(el.relativeFilePath),
        );
        if (filteredLambdaRoutes.length === 0) {
          warn(
            `Cannot perform command '${command}'. No routes match supplied filter ${argv.route}.`,
          );
          return;
        }
      }
    }

    if (command === 'infra') {
      const infraOperation = argv._[1] as string;
      const deploymentName = argv.deployment as string;
      let targetVersion: string | undefined;
      let confirm: boolean | undefined;
      let commandArgs: string[] | undefined;

      if (infraOperation === 'upgrade') {
        targetVersion = argv.targetVersion as string;
      } else if (infraOperation === 'terraform') {
        commandArgs = opArgs.slice(2);
      } else if (infraOperation === 'destroy') {
        confirm = argv.yes as boolean;
      }

      await terraformAwsCli({
        infraOperation,
        deploymentName,
        targetVersion,
        confirm,
        commandArguments: commandArgs,
        ignoreMissingDeployments: argv['ignore-missing-deployments'] || false,
        skipConfirmations: false,
        options: {
          // temporary workaround for https://github.com/goldstack/goldstack/issues/40
          parallelism: 1,
        },
      });
      return;
    }

    if (command === 'build') {
      if (
        argv['ignore-missing-deployments'] &&
        !packageConfig.hasDeployment(argv.deployment as string)
      ) {
        warn(`Deployment '${argv.deployment}' does not exist. Skipping build.`);
        return;
      }
      const deployment = packageConfig.getDeployment(argv.deployment as string);
      let routeFilter: undefined | string;
      if (argv.route) {
        routeFilter = `*${argv.route}*`;
      }
      const lambdaNamePrefix = deployment.configuration.lambdaNamePrefix;
      // bundles need to be built first since static mappings are updated
      // during bundle built and they are injected into function bundle
      const packageRootDir = pwd();
      await buildBundles({
        routesDir: defaultRoutesPath,
        configs: filteredLambdaRoutes,
        deploymentName: deployment.name,
        lambdaNamePrefix: lambdaNamePrefix || '',
        buildConfig,
        packageRootDir,
      });
      await buildFunctions({
        routesDir: defaultRoutesPath,
        deploymentName: deployment.name,
        buildOptions: buildConfig.createServerBuildOptions,
        configs: filteredLambdaRoutes,
        lambdaNamePrefix: lambdaNamePrefix || '',
        routeFilter,
        packageRootDir,
      });
      return;
    }

    if (command === 'deploy') {
      const deploymentName = argv.deployment as string;
      if (argv['ignore-missing-deployments'] && !packageConfig.hasDeployment(deploymentName)) {
        warn(
          `Deployment '${deploymentName}' does not exist. Skipping deploy due to --ignore-missing-deployments flag.`,
        );
        return;
      }
      const deployment = packageConfig.getDeployment(deploymentName);
      const config = deployment.configuration;

      const deploymentState = readDeploymentState('./', deployment.name);
      const staticFilesBucket = readTerraformStateVariable(deploymentState, 'static_files_bucket');
      const publicFilesBucket = readTerraformStateVariable(deploymentState, 'public_files_bucket');
      const packageRootFolder = pwd();
      await Promise.all([
        deployFunctions({
          routesPath: defaultRoutesPath,
          configuration: createLambdaAPIDeploymentConfiguration(config),
          deployment,
          config: filteredLambdaRoutes,
          packageRootFolder,
        }),
        deployToS3({
          configuration: createLambdaAPIDeploymentConfiguration(config),
          deployment,
          staticFilesBucket,
          publicFilesBucket,
          packageRootFolder,
        }),
      ]);
      return;
    }

    throw new Error(`Unknown command: ${command}`);
  });
};

export function readFunctionConfig(): {
  config: SSRPackage;
  lambdaRoutes: LambdaConfig[];
  packageConfig: PackageConfig<SSRPackage, SSRDeployment>;
} {
  const packageConfig = new PackageConfig<SSRPackage, SSRDeployment>({
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
  return { config, lambdaRoutes, packageConfig };
}
