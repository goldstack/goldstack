'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AssertStaticWebsiteAwsDeploymentsTest =
  exports.assertWebsiteRedirect =
  exports.assertWebsiteAvailable =
    void 0;
const utils_log_1 = require('@goldstack/utils-log');
const utils_package_1 = require('@goldstack/utils-package');
const assert_1 = __importDefault(require('assert'));
const axios_1 = __importDefault(require('axios'));
const assertWebsiteAvailable = async (url) => {
  const resp = await axios_1.default.get(url);
  (0, assert_1.default)(
    resp.status === 200 || resp.status === 304,
    `HTTP call to website resulted in non success reponse code: ${resp.status} ${resp.statusText} (${url})`,
  );
};
exports.assertWebsiteAvailable = assertWebsiteAvailable;
const assertWebsiteRedirect = async (url, expectedForwardUrl) => {
  const resp = await axios_1.default.get(url);
  if (resp.status === 200 || resp.status === 304) {
    (0, assert_1.default)(
      resp.request.res.responseUrl === expectedForwardUrl,
      `Forwarded to unepxected URL ${resp.request.res.responseUrl}. Expected: ${expectedForwardUrl}`,
    );
    return;
  }
  (0, assert_1.default)(
    resp.status === 301,
    `HTTP call to website resulted in no redirect reponse code: ${resp.status} ${resp.statusText} (${url})`,
  );
  (0, assert_1.default)(
    resp.headers.Location === expectedForwardUrl,
    `Unexpected forward URL: ${resp.headers.Location}. Expected: ${expectedForwardUrl}`,
  );
};
exports.assertWebsiteRedirect = assertWebsiteRedirect;
class AssertStaticWebsiteAwsDeploymentsTest {
  getName() {
    return 'assert-static-website-aws-deployments';
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
      const staticWebsite1Url = `https://${deployment.configuration.websiteDomain}/`;
      await (0, exports.assertWebsiteAvailable)(staticWebsite1Url);
      await (0, exports.assertWebsiteRedirect)(
        `http://${deployment.configuration.websiteDomain}`,
        staticWebsite1Url,
      );
      await (0, exports.assertWebsiteRedirect)(
        `https://${deployment.configuration.websiteDomainRedirect}`,
        staticWebsite1Url,
      );
      await (0, exports.assertWebsiteRedirect)(
        `http://${deployment.configuration.websiteDomainRedirect}`,
        staticWebsite1Url,
      );
    }
  }
}
exports.AssertStaticWebsiteAwsDeploymentsTest = AssertStaticWebsiteAwsDeploymentsTest;
//# sourceMappingURL=AssertStaticWebsiteAwsDeploymentsTest.js.map
