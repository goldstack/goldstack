'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.EnsureBabelRcDoesNotExist = void 0;
const fs_1 = require('fs');
const path_1 = require('path');
class EnsureBabelRcDoesNotExist {
  getName() {
    return 'ensure-babelrc-does-not-exist';
  }
  async runTest(params) {
    const packageDir = params.packageDir;
    const babelRcThere = (0, fs_1.existsSync)((0, path_1.join)('.babelrc'));
    if (babelRcThere) {
      throw new Error(`.babelrc should not exist but found in directory: ${packageDir}`);
    }
  }
}
exports.EnsureBabelRcDoesNotExist = EnsureBabelRcDoesNotExist;
//# sourceMappingURL=EnsureBabelRcDoesNotExist.js.map
