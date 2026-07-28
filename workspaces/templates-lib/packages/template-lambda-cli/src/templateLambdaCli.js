'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.run = exports.deployLambda = void 0;
const utils_cli_1 = require('@goldstack/utils-cli');
const utils_log_1 = require('@goldstack/utils-log');
const utils_package_1 = require('@goldstack/utils-package');
const utils_package_config_1 = require('@goldstack/utils-package-config');
const utils_terraform_1 = require('@goldstack/utils-terraform');
const utils_terraform_aws_1 = require('@goldstack/utils-terraform-aws');
const templateLambdaCliDeploy_1 = require('./templateLambdaCliDeploy');
__exportStar(require('./types/LambdaPackage'), exports);
const yargs_1 = __importDefault(require('yargs'));
var templateLambdaCliDeploy_2 = require('./templateLambdaCliDeploy');
Object.defineProperty(exports, 'deployLambda', {
  enumerable: true,
  get: function () {
    return templateLambdaCliDeploy_2.deployCli;
  },
});
const run = async (args) => {
  await (0, utils_cli_1.wrapCli)(async () => {
    const argv = await (0, utils_package_1.buildCli)({
      yargs: yargs_1.default,
      deployCommands: (0, utils_package_1.buildDeployCommands)(),
      infraCommands: (0, utils_terraform_1.infraCommands)(),
    })
      .help()
      .parse();
    const packageConfig = new utils_package_config_1.PackageConfig({
      packagePath: './',
    });
    const _config = packageConfig.getConfig();
    const [, , , ...opArgs] = args;
    const command = argv._[0];
    // console.log(JSON.stringify(argv, null, 2));
    if (command === 'infra') {
      const infraOperation = argv._[1];
      const deploymentName = argv.deployment;
      let targetVersion;
      let confirm;
      let commandArgs;
      if (infraOperation === 'upgrade') {
        targetVersion = opArgs[2];
      } else if (infraOperation === 'terraform') {
        commandArgs = opArgs.slice(2);
      } else if (infraOperation === 'destroy') {
        confirm = argv.yes || opArgs.includes('-y');
      }
      await (0, utils_terraform_aws_1.terraformAwsCli)({
        infraOperation,
        deploymentName,
        targetVersion,
        confirm,
        commandArguments: commandArgs,
        ignoreMissingDeployments: argv['ignore-missing-deployments'] || false,
        skipConfirmations: argv.yes || false,
        options: undefined,
      });
      return;
    }
    if (command === 'deploy') {
      // Determine deployment name from parsed argv (positional) or fallback to argv._ array
      const deploymentName = argv.deployment;
      if (!deploymentName) {
        throw new Error('No deployment provided');
      }
      if (!packageConfig.hasDeployment(deploymentName)) {
        if (argv['ignore-missing-deployments']) {
          (0, utils_log_1.warn)(
            `Deployment '${deploymentName}' does not exist. Skipping deploy due to --ignore-missing-deployments flag.`,
          );
          return;
        } else {
          throw new Error(`Cannot find configuration for deployment '${deploymentName}'`);
        }
      }
      await (0, templateLambdaCliDeploy_1.deployCli)(packageConfig.getDeployment(deploymentName));
      return;
    }
    throw new Error(`Unknown command: ${command}`);
  });
};
exports.run = run;
//# sourceMappingURL=templateLambdaCli.js.map
