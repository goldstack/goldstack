'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.getFromDomain =
  exports.getMockedSES =
  exports.createSESClient =
  exports.getSentEmailRequests =
  exports.connect =
    void 0;
const template_email_send_1 = require('@goldstack/template-email-send');
const goldstack_json_1 = __importDefault(require('./../goldstack.json'));
const package_schema_json_1 = __importDefault(require('./../schemas/package.schema.json'));
const connect = async (deploymentName) => {
  return await (0, template_email_send_1.connect)(
    goldstack_json_1.default,
    package_schema_json_1.default,
    deploymentName,
  );
};
exports.connect = connect;
const getSentEmailRequests = (client) => {
  return (0, template_email_send_1.getSentEmailRequests)(client);
};
exports.getSentEmailRequests = getSentEmailRequests;
const createSESClient = (client) => {
  return (0, template_email_send_1.createSESClient)(client);
};
exports.createSESClient = createSESClient;
const getMockedSES = () => {
  return (0, template_email_send_1.getMockedSES)();
};
exports.getMockedSES = getMockedSES;
const getFromDomain = async (deploymentName) => {
  return (0, template_email_send_1.getFromDomain)(
    goldstack_json_1.default,
    package_schema_json_1.default,
    deploymentName,
  );
};
exports.getFromDomain = getFromDomain;
//# sourceMappingURL=ses.js.map
