'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AssertRootFilesTest = void 0;
const utils_config_1 = require('@goldstack/utils-config');
const utilsTemplateTest_1 = require('../utilsTemplateTest');
class AssertRootFilesTest {
  getName() {
    return 'assert-root-files';
  }
  async runTest(params) {
    const projectDir = params.projectDir;
    const awsConfigPath = (0, utils_config_1.getAwsConfigPath)(params.projectDir);
    (0, utilsTemplateTest_1.assertFilesExist)([
      `${projectDir}biome.jsonc`,
      `${projectDir}config/infra/aws/.gitignore`,
      `${projectDir}config/goldstack/.gitignore`,
      awsConfigPath,
    ]);
  }
}
exports.AssertRootFilesTest = AssertRootFilesTest;
//# sourceMappingURL=AssertRootFilesTest.js.map
