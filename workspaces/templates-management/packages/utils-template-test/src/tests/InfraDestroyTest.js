'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.InfraDestroyTest = void 0;
const utils_log_1 = require('@goldstack/utils-log');
const utils_package_1 = require('@goldstack/utils-package');
const utils_sh_1 = require('@goldstack/utils-sh');
const utils_yarn_1 = require('@goldstack/utils-yarn');
const fs_1 = require('fs');
const path_1 = __importDefault(require('path'));
const Utils_1 = require('./Utils');
class InfraDestroyTest {
  getName() {
    return 'infra-destroy';
  }
  async runTest(params) {
    const packageConfig = (0, utils_package_1.readPackageConfigFromDir)(params.packageDir);
    const packageJson = JSON.parse(
      (0, utils_sh_1.read)(path_1.default.join(params.packageDir, 'package.json')),
    );
    if (
      !(0, fs_1.existsSync)(path_1.default.join(params.packageDir, 'infra', 'aws', '.terraform'))
    ) {
      (0, utils_log_1.warn)('Skipping destroying infrastructure since terraform not initialised.');
      return;
    }
    for (const deployment of packageConfig.deployments) {
      (0, utils_log_1.info)(`Destroying infrastructure for ${deployment.name}`);
      await (0, Utils_1.retryOperation)(
        async () => {
          process.env.GOLDSTACK_DEBUG = 'true';
          (0, utils_yarn_1.yarn)(
            params.projectDir,
            `workspace ${packageJson.name} infra destroy ${deployment.name} -y`,
          );
        },
        120000,
        20,
      );
    }
  }
}
exports.InfraDestroyTest = InfraDestroyTest;
//# sourceMappingURL=InfraDestroyTest.js.map
