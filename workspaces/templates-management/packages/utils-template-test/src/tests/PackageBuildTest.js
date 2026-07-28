'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.PackageBuildTest = void 0;
const utils_yarn_1 = require('@goldstack/utils-yarn');
class PackageBuildTest {
  getName() {
    return 'package-build';
  }
  async runTest(params) {
    const packageDir = params.packageDir;
    const projectDir = params.projectDir;
    (0, utils_yarn_1.yarn)(projectDir, 'clean');
    (0, utils_yarn_1.yarn)(projectDir, 'build');
    (0, utils_yarn_1.yarn)(packageDir, 'clean');
    (0, utils_yarn_1.yarn)(packageDir, 'build');
    // compile should work as stand alone command (already tested with build implicitly before)
    (0, utils_yarn_1.yarn)(packageDir, 'compile');
    // testing clean after build
    (0, utils_yarn_1.yarn)(packageDir, 'clean');
    // ensure all dist files available for testing
    (0, utils_yarn_1.yarn)(packageDir, 'build');
  }
}
exports.PackageBuildTest = PackageBuildTest;
//# sourceMappingURL=PackageBuildTest.js.map
