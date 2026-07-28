'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AssertPackageFilesTest = void 0;
const utilsTemplateTest_1 = require('../utilsTemplateTest');
class AssertPackageFilesTest {
  getName() {
    return 'assert-package-files';
  }
  async runTest(params) {
    const packageDir = params.packageDir;
    (0, utilsTemplateTest_1.assertFilesExist)([
      `${packageDir}package.json`,
      `${packageDir}goldstack.json`,
      `${packageDir}schemas/package.schema.json`,
    ]);
    (0, utilsTemplateTest_1.assertFilesDoNotExist)([`${packageDir}template.json`]);
  }
}
exports.AssertPackageFilesTest = AssertPackageFilesTest;
//# sourceMappingURL=AssertPackageFilesTest.js.map
