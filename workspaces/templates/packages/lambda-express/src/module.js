'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.getEndpoint = exports.stopTestServer = exports.startTestServer = void 0;
const utils_esbuild_1 = require('@goldstack/utils-esbuild');
const goldstack_json_1 = __importDefault(require('./../goldstack.json'));
let testServerPort = null;
// biome-ignore lint/suspicious/noExplicitAny: Dynamic server instance from require()
let testServer = null;
if (process.env.TEST_SERVER_PORT) {
  testServerPort = parseInt(process.env.TEST_SERVER_PORT, 10);
}
/**
 * Starts a test server for local development and testing of Express.js applications.
 *
 * @param port - The port number to start the server on.
 * @returns {Promise<void>} A promise that resolves when the server has started.
 */
const startTestServer = async (port) => {
  const server = require((0, utils_esbuild_1.excludeInBundle)('./server.ts'));
  testServer = await server.start(port);
  testServerPort = port;
};
exports.startTestServer = startTestServer;
/**
 * Stops the test server if it's running.
 *
 * @returns {Promise<void>} A promise that resolves when the server has been stopped.
 */
const stopTestServer = async () => {
  return new Promise((resolve, reject) => {
    testServer.close((err) => {
      if (err) reject(err);
      resolve();
    });
  });
};
exports.stopTestServer = stopTestServer;
/**
 * Gets the endpoint URL for the Express.js Lambda deployment.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns The endpoint URL string.
 * * @returns {string} The endpoint URL for the Express.js Lambda deployment.
 *
 * @throws {Error} If the deployment cannot be found.
 */
const getEndpoint = (deploymentName) => {
  if (!deploymentName) {
    deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
  }
  if (deploymentName === 'local') {
    const port = testServerPort || 3030;
    return `http://localhost:${port}`;
  }
  const deployment = goldstack_json_1.default.deployments.find(
    // biome-ignore lint/suspicious/noExplicitAny: Deployment configuration has dynamic properties
    (deployment) => deployment.name === deploymentName,
  );
  if (!deployment) {
    throw new Error(`Cannot find deployment with name ${deploymentName}`);
  }
  // biome-ignore lint/suspicious/noExplicitAny: Deployment configuration has dynamic properties
  return `https://${deployment.configuration.apiDomain}`;
};
exports.getEndpoint = getEndpoint;
//# sourceMappingURL=module.js.map
