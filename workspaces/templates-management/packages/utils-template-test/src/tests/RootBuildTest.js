'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.RootBuildTest = void 0;
const utils_yarn_1 = require('@goldstack/utils-yarn');
class RootBuildTest {
  getName() {
    return 'root-build';
  }
  async runTest(params) {
    const projectDir = params.projectDir;
    // formatting should work
    (0, utils_yarn_1.yarn)(projectDir, 'format');
    (0, utils_yarn_1.yarn)(projectDir, 'format-check');
    // linting should work
    (0, utils_yarn_1.yarn)(projectDir, 'lint-fix');
    (0, utils_yarn_1.yarn)(projectDir, 'lint');
    // checking (sorting imports) should work
    (0, utils_yarn_1.yarn)(projectDir, 'check-fix');
    (0, utils_yarn_1.yarn)(projectDir, 'check');
    // workspace dependencies should be valid
    // some error with package:doctor coming up during local install
    // yarn(projectDir, 'package:doctor');
    // testing clean before build
    (0, utils_yarn_1.yarn)(projectDir, 'clean');
    (0, utils_yarn_1.yarn)(projectDir, 'build');
    // compile should work as stand alone command (already tested with build implicitly before)
    (0, utils_yarn_1.yarn)(projectDir, 'compile');
    // tests should work
    (0, utils_yarn_1.yarn)(projectDir, 'test');
    // testing clean after build
    (0, utils_yarn_1.yarn)(projectDir, 'clean');
    // ensure all dist files available for testing
    (0, utils_yarn_1.yarn)(projectDir, 'build');
  }
}
exports.RootBuildTest = RootBuildTest;
//# sourceMappingURL=RootBuildTest.js.map
