'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.IgnoreMissingDeploymentsTest = void 0;
const utils_sh_1 = require('@goldstack/utils-sh');
const utils_yarn_1 = require('@goldstack/utils-yarn');
const path_1 = __importDefault(require('path'));
class IgnoreMissingDeploymentsTest {
  getName() {
    return 'ignore-missing-deployments-test';
  }
  async runTest(params) {
    const packageJsonPath = path_1.default.join(params.packageDir, 'package.json');
    const packageJson = JSON.parse((0, utils_sh_1.read)(packageJsonPath));
    const fakeDeploymentName = 'non-existent-deployment-test';
    // Test without flag - should fail
    let failedAsExpected = false;
    try {
      (0, utils_yarn_1.yarn)(
        params.projectDir,
        `workspace ${packageJson.name} infra plan ${fakeDeploymentName}`,
      );
    } catch (_e) {
      failedAsExpected = true;
      console.log('Command failed as expected without --ignore-missing-deployments flag');
    }
    if (!failedAsExpected) {
      throw new Error(
        'Expected command to fail without --ignore-missing-deployments flag, but it succeeded',
      );
    }
    // Test with flag - should succeed with warning
    (0, utils_yarn_1.yarn)(
      params.projectDir,
      `workspace ${packageJson.name} infra plan ${fakeDeploymentName} --ignore-missing-deployments`,
    );
    console.log('Command succeeded with --ignore-missing-deployments flag');
  }
}
exports.IgnoreMissingDeploymentsTest = IgnoreMissingDeploymentsTest;
//# sourceMappingURL=IgnoreMissingDeploymentsTest.js.map
