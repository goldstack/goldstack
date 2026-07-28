'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AssertWebsiteTest = exports.assertWebsiteAvailable = void 0;
const utils_log_1 = require('@goldstack/utils-log');
const utils_package_1 = require('@goldstack/utils-package');
const assert_1 = __importDefault(require('assert'));
const axios_1 = __importDefault(require('axios'));
const assertWebsiteAvailable = async (url) => {
  const resp = await axios_1.default.get(url);
  (0, assert_1.default)(
    resp.status === 200 || resp.status === 304,
    `HTTP call to website resulted in non success response code: ${resp.status} ${resp.statusText} (${url})`,
  );
};
exports.assertWebsiteAvailable = assertWebsiteAvailable;
class AssertWebsiteTest {
  getName() {
    return 'assert-website';
  }
  async runTest(params) {
    const packageConfig = (0, utils_package_1.readPackageConfigFromDir)(params.packageDir);
    for (const deployment of packageConfig.deployments) {
      (0, utils_log_1.info)(
        'Asserting website deployed for ' +
          deployment.name +
          ' deployed to ' +
          deployment.configuration.websiteDomain,
      );
      const website1Url = `https://${deployment.configuration.websiteDomain}/`;
      await (0, exports.assertWebsiteAvailable)(website1Url);
    }
  }
}
exports.AssertWebsiteTest = AssertWebsiteTest;
//# sourceMappingURL=AssertWebsiteTest.js.map
