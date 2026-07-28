'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.DeployTest = void 0;
const utils_log_1 = require('@goldstack/utils-log');
const utils_package_1 = require('@goldstack/utils-package');
const utils_sh_1 = require('@goldstack/utils-sh');
const utils_yarn_1 = require('@goldstack/utils-yarn');
class DeployTest {
  getName() {
    return 'deploy';
  }
  async runTest(params) {
    const packageConfig = (0, utils_package_1.readPackageConfigFromDir)(params.packageDir);
    const packageJson = JSON.parse((0, utils_sh_1.read)(`${params.packageDir}package.json`));
    for (const deployment of packageConfig.deployments) {
      (0, utils_log_1.info)(`Deploying: ${deployment.name}`);
      (0, utils_yarn_1.yarn)(
        params.projectDir,
        `workspace ${packageJson.name} deploy ${deployment.name}`,
      );
    }
  }
}
exports.DeployTest = DeployTest;
//# sourceMappingURL=DeployTest.js.map
