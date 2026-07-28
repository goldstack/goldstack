'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.InfraPlanTest = void 0;
const utils_package_1 = require('@goldstack/utils-package');
const utils_sh_1 = require('@goldstack/utils-sh');
const utils_yarn_1 = require('@goldstack/utils-yarn');
class InfraPlanTest {
  getName() {
    return 'infra-plan';
  }
  async runTest(params) {
    const packageConfig = (0, utils_package_1.readPackageConfigFromDir)(params.packageDir);
    const packageJson = JSON.parse((0, utils_sh_1.read)(`${params.packageDir}package.json`));
    for (const deployment of packageConfig.deployments) {
      console.log('Building infrastructure for', deployment.name);
      (0, utils_yarn_1.yarn)(
        params.projectDir,
        `workspace ${packageJson.name} infra init ${deployment.name}`,
      );
      (0, utils_yarn_1.yarn)(
        params.projectDir,
        `workspace ${packageJson.name} infra plan ${deployment.name}`,
      );
    }
  }
}
exports.InfraPlanTest = InfraPlanTest;
//# sourceMappingURL=InfraPlanTest.js.map
