'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.PackageBuildLambdaTest = void 0;
const utils_package_1 = require('@goldstack/utils-package');
const utils_yarn_1 = require('@goldstack/utils-yarn');
class PackageBuildLambdaTest {
  getName() {
    return 'package-build-lambda';
  }
  async runTest(params) {
    const packageDir = params.packageDir;
    const packageConfig = (0, utils_package_1.readPackageConfigFromDir)(params.packageDir);
    for (const deployment of packageConfig.deployments) {
      (0, utils_yarn_1.yarn)(packageDir, `build-lambda ${deployment.name}`);
    }
  }
}
exports.PackageBuildLambdaTest = PackageBuildLambdaTest;
//# sourceMappingURL=PackageBuildLambdaTest.js.map
