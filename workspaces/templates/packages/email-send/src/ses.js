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
/**
 * Connects to AWS SES (Simple Email Service) for a given deployment.
 *
 * This function establishes a connection to SES using the configuration specified in the
 * package's goldstack.json and schema. If no deployment name is provided, it will use
 * the value of the `GOLDSTACK_DEPLOYMENT` environment variable. For the 'local' deployment,
 * a mocked SES client is returned.
 *
 * @param {string} [deploymentName] - Optional name of the deployment to connect to.
 * @returns {Promise<SESClient>} A promise that resolves to an SES client instance.
 */
const connect = async (deploymentName) => {
  return await (0, template_email_send_1.connect)(
    goldstack_json_1.default,
    package_schema_json_1.default,
    deploymentName,
  );
};
exports.connect = connect;
/**
 * Retrieves the list of email send requests that have been sent using a mocked SES client.
 *
 * This function accesses the internal sent requests stored in the mocked SES client
 * and returns them as an array of `SendEmailRequest` objects. It is only useful when
 * using a mocked SES client (e.g., in local development or tests).
 *
 * @param {SESClient} client - The mocked SES client instance.
 * @returns {SendEmailRequest[]} An array of email send requests that have been sent.
 */
const getSentEmailRequests = (client) => {
  return (0, template_email_send_1.getSentEmailRequests)(client);
};
exports.getSentEmailRequests = getSentEmailRequests;
/**
 * Creates an SES (Simple Email Service) client.
 *
 * This function returns an SES client instance. If a client is provided as an argument,
 * it will be used; otherwise, a new client will be created. In non‑local environments
 * this will be a real AWS SES client, while in local development a mocked client is returned.
 *
 * @param {SESClient} [client] - An optional SES client instance to use.
 * @returns {SESClient} The SES client instance.
 */
const createSESClient = (client) => {
  return (0, template_email_send_1.createSESClient)(client);
};
exports.createSESClient = createSESClient;
/**
 * Returns a mocked SES client instance for local development and testing.
 *
 * The mocked client records sent email requests and allows inspecting them via
 * `getSentEmailRequests`. It does not actually send emails.
 *
 * @returns {SESClient} A mocked SES client instance.
 */
const getMockedSES = () => {
  return (0, template_email_send_1.getMockedSES)();
};
exports.getMockedSES = getMockedSES;
/**
 * Retrieves the domain configured for sending emails in a given deployment.
 *
 * This function reads the package configuration to determine the domain that will be used
 * as the `From` address for emails sent via SES. For the 'local' deployment, a test domain
 * is returned.
 *
 * @param {string} [deploymentName] - Optional name of the deployment.
 * @returns {Promise<string>} A promise that resolves to the domain string.
 */
const getFromDomain = async (deploymentName) => {
  return (0, template_email_send_1.getFromDomain)(
    goldstack_json_1.default,
    package_schema_json_1.default,
    deploymentName,
  );
};
exports.getFromDomain = getFromDomain;
//# sourceMappingURL=ses.js.map
