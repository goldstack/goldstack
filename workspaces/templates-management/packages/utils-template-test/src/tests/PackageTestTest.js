'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.PackageTestTest = void 0;
const utils_yarn_1 = require('@goldstack/utils-yarn');
class PackageTestTest {
  getName() {
    return 'package-test';
  }
  async runTest(params) {
    const packageDir = params.packageDir;
    // testing clean after build
    (0, utils_yarn_1.yarn)(packageDir, 'test');
  }
}
exports.PackageTestTest = PackageTestTest;
//# sourceMappingURL=PackageTestTest.js.map
