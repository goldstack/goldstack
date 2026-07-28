'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.DestroyStateBucketTest = void 0;
const utils_log_1 = require('@goldstack/utils-log');
const utils_package_1 = require('@goldstack/utils-package');
const utils_sh_1 = require('@goldstack/utils-sh');
const utils_yarn_1 = require('@goldstack/utils-yarn');
const Utils_1 = require('./Utils');
class DestroyStateBucketTest {
  getName() {
    return 'destroy-state-bucket';
  }
  async runTest(params) {
    const packageConfig = (0, utils_package_1.readPackageConfigFromDir)(params.packageDir);
    const packageJson = JSON.parse((0, utils_sh_1.read)(`${params.packageDir}package.json`));
    for (const deployment of packageConfig.deployments) {
      (0, utils_log_1.info)(`Destroying remote state bucket for ${deployment.name}`);
      await (0, Utils_1.retryOperation)(
        async () => {
          process.env.GOLDSTACK_DEBUG = 'true';
          (0, utils_yarn_1.yarn)(
            params.projectDir,
            `workspace ${packageJson.name} infra destroy-state-bucket ${deployment.name} -y`,
          );
        },
        120000,
        20,
      );
    }
  }
}
exports.DestroyStateBucketTest = DestroyStateBucketTest;
//# sourceMappingURL=DestroyStateBucketTest.js.map
