'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.run = void 0;
const utils_aws_lambda_1 = require('@goldstack/utils-aws-lambda');
const utils_cli_1 = require('@goldstack/utils-cli');
const utils_log_1 = require('@goldstack/utils-log');
const utils_package_1 = require('@goldstack/utils-package');
const utils_package_config_1 = require('@goldstack/utils-package-config');
const utils_sh_1 = require('@goldstack/utils-sh');
const utils_terraform_1 = require('@goldstack/utils-terraform');
const utils_terraform_aws_1 = require('@goldstack/utils-terraform-aws');
const fs_1 = __importDefault(require('fs'));
const outmatch_1 = __importDefault(require('outmatch'));
const yargs_1 = __importDefault(require('yargs'));
const templateLambdaConsts_1 = require('./templateLambdaConsts');
const run = async (args) => {
  await (0, utils_cli_1.wrapCli)(async () => {
    const argv = await (0, utils_package_1.buildCli)({
      yargs: yargs_1.default,
      deployCommands: (0, utils_package_1.buildDeployCommands)(),
      infraCommands: (0, utils_terraform_1.infraCommands)(),
    })
      .command('build [deployment] [filter]', 'Build lambdas', () => {
        return yargs_1.default
          .positional('deployment', {
            type: 'string',
            describe: 'Name of the deployment this command should be applied to',
            default: '',
          })
          .positional('filter', {
            type: 'string',
            describe: 'Regex filter for lambda name',
            demandOption: false,
          });
      })
      .command('deploy [deployment] [filter]', 'Deploy lambdas', () => {
        return yargs_1.default
          .positional('deployment', {
            type: 'string',
            describe: 'Name of the deployment this command should be applied to',
            default: '',
          })
          .positional('filter', {
            type: 'string',
            describe: 'Regex filter for lambda name',
            demandOption: false,
          });
      })
      .option('ignore-missing-deployments', {
        type: 'boolean',
        describe: 'Ignore missing deployments',
        default: false,
      })
      .help()
      .parse();
    const packageConfig = new utils_package_config_1.PackageConfig({
      packagePath: './',
    });
    const config = packageConfig.getConfig();
    const [, , , ...opArgs] = args;
    // update routes
    if (!fs_1.default.existsSync(templateLambdaConsts_1.defaultRoutesPath)) {
      throw new Error(
        `Please specify lambda function handlers in ${templateLambdaConsts_1.defaultRoutesPath} so that API Gateway route configuration can be generated.`,
      );
    }
    const lambdaRoutes = (0, utils_aws_lambda_1.readLambdaConfig)(
      templateLambdaConsts_1.defaultRoutesPath,
    );
    let filteredLambdaRoutes = lambdaRoutes;
    config.deployments = config.deployments.map((e) => {
      const lambdasConfigs = (0, utils_aws_lambda_1.generateLambdaConfig)(
        e.configuration,
        filteredLambdaRoutes,
      );
      e.configuration.lambdas = lambdasConfigs;
      (0, utils_aws_lambda_1.validateDeployment)(e.configuration.lambdas);
      return e;
    });
    (0, utils_package_1.writePackageConfig)(config);
    const command = argv._[0];
    const deploymentName = argv.deployment;
    const routeFilterArg = argv.filter;
    const routeFilter = routeFilterArg ? `*${routeFilterArg}*` : undefined;
    if (routeFilter && (command === 'build' || command === 'deploy')) {
      filteredLambdaRoutes = filteredLambdaRoutes.filter((el) => {
        const result =
          (0, outmatch_1.default)(`**/*${routeFilterArg}*`)(el.relativeFilePath) ||
          (0, outmatch_1.default)(`**/*${routeFilterArg}*/*`)(el.relativeFilePath);
        (0, utils_log_1.debug)(
          `Filtering lambdas. Testing: ${el.relativeFilePath} to match ${routeFilter}. Result: ${result}`,
        );
        return result;
      });
      if (filteredLambdaRoutes.length === 0) {
        (0, utils_log_1.warn)(
          `Cannot perform command '${command}'. No routes match supplied filter ${routeFilterArg}.`,
        );
        return;
      }
    }
    if (command === 'infra') {
      const infraOperation = argv._[1];
      const deploymentName = argv.deployment;
      let targetVersion;
      let confirm;
      let commandArgs;
      if (infraOperation === 'upgrade') {
        targetVersion = argv.targetVersion;
      } else if (infraOperation === 'terraform') {
        commandArgs = opArgs.slice(2);
      } else if (infraOperation === 'destroy') {
        confirm = argv.yes;
      }
      await (0, utils_terraform_aws_1.terraformAwsCli)({
        infraOperation,
        deploymentName,
        targetVersion,
        confirm,
        commandArguments: commandArgs,
        ignoreMissingDeployments: argv['ignore-missing-deployments'] || false,
        skipConfirmations: argv.yes || false,
        options: {
          // temporary workaround for https://github.com/goldstack/goldstack/issues/40
          parallelism: 1,
        },
      });
      return;
    }
    if (command === 'build') {
      if (argv.ignoreMissingDeployments && !packageConfig.hasDeployment(deploymentName)) {
        (0, utils_log_1.warn)(`Deployment '${deploymentName}' does not exist. Skipping build.`);
        return;
      }
      const deployment = packageConfig.getDeployment(deploymentName);
      await (0, utils_aws_lambda_1.buildFunctions)({
        routesDir: templateLambdaConsts_1.defaultRoutesPath,
        buildOptions: (0, utils_aws_lambda_1.defaultBuildOptions)(),
        deploymentName: deployment.name,
        configs: filteredLambdaRoutes,
        routeFilter,
        lambdaNamePrefix: deployment.configuration.lambdaNamePrefix || '',
        packageRootDir: (0, utils_sh_1.pwd)(),
      });
      return;
    }
    if (command === 'deploy') {
      if (!packageConfig.hasDeployment(deploymentName)) {
        if (argv.ignoreMissingDeployments) {
          (0, utils_log_1.warn)(
            `Deployment '${deploymentName}' does not exist. Skipping deploy due to --ignore-missing-deployments flag.`,
          );
          return;
        } else {
          throw new Error(`Cannot find configuration for deployment '${deploymentName}'`);
        }
      }
      await (0, utils_aws_lambda_1.deployFunctions)({
        routesPath: templateLambdaConsts_1.defaultRoutesPath,
        configuration: packageConfig.getDeployment(deploymentName).configuration,
        deployment: packageConfig.getDeployment(deploymentName),
        config: filteredLambdaRoutes,
        packageRootFolder: (0, utils_sh_1.pwd)(),
      });
      return;
    }
    throw new Error(`Unknown command: ${command}`);
  });
};
exports.run = run;
//# sourceMappingURL=templateLambdaApiCli.js.map
