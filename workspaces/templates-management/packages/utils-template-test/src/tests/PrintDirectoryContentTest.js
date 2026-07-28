'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.PrintDirectoryContentTest = void 0;
const utils_log_1 = require('@goldstack/utils-log');
const utils_sh_1 = require('@goldstack/utils-sh');
class PrintDirectoryContentTest {
  getName() {
    return 'print-directory-content';
  }
  async runTest(params) {
    const packageDir = params.packageDir;
    const projectDir = params.projectDir;
    (0, utils_sh_1.cd)(projectDir);
    (0, utils_log_1.info)(`Files in project root at ${projectDir}`);
    (0, utils_sh_1.exec)('ls -la', { silent: false });
    if (packageDir) {
      (0, utils_sh_1.cd)(packageDir);
      (0, utils_log_1.info)(`Files in package at ${packageDir}`);
      (0, utils_sh_1.exec)('ls -la', { silent: false });
    } else {
      (0, utils_log_1.info)('Cannot print package files since package directory not supplied');
    }
  }
}
exports.PrintDirectoryContentTest = PrintDirectoryContentTest;
//# sourceMappingURL=PrintDirectoryContentTest.js.map
