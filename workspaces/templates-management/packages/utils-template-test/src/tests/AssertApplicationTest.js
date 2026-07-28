'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AssertApplicationTest = exports.assertEndpointAvaialble = void 0;
const utils_package_1 = require('@goldstack/utils-package');
const assert_1 = __importDefault(require('assert'));
const axios_1 = __importDefault(require('axios'));
const Utils_1 = require('./Utils');
const assertEndpointAvaialble = async (url) => {
  const resp = await axios_1.default.get(url);
  (0, assert_1.default)(
    resp.status === 200 || resp.status === 304 || resp.status === 201,
    `HTTP call to API resulted in non success response code: ${resp.status} ${resp.statusText} (${url})`,
  );
  console.log(`Received result from API '${JSON.stringify(resp.data, null, 2)}'`);
  // assert(
  //   resp.data === 'success',
  //   `API returned unexpected data: '${resp.data}'`
  // );
};
exports.assertEndpointAvaialble = assertEndpointAvaialble;
class AssertApplicationTest {
  getName() {
    return 'assert-application';
  }
  async runTest(params) {
    const packageConfig = (0, utils_package_1.readPackageConfigFromDir)(params.packageDir);
    for (const deployment of packageConfig.deployments) {
      const applicationUrl = `https://${deployment.configuration.domain}/`;
      console.log(
        'Asserting application deployed for',
        deployment.name,
        'deployed to',
        applicationUrl,
      );
      // in case there are delays with DNS resolution
      await (0, Utils_1.retryOperation)(
        async () => {
          await (0, exports.assertEndpointAvaialble)(applicationUrl);
        },
        10000,
        6 * 15,
      );
    }
  }
}
exports.AssertApplicationTest = AssertApplicationTest;
//# sourceMappingURL=AssertApplicationTest.js.map
