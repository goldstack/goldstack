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
const cors = process.env.CORS;
let testServerPort = null;
let testServer = null;
if (process.env.TEST_SERVER_PORT) {
  testServerPort = parseInt(process.env.TEST_SERVER_PORT, 10);
}
/**
 * Starts a test server for local development and testing.
 *
 * @param port - Optional port number to start the server on. Defaults to 5054.
 * @returns A promise that resolves with the test server instance.
 */
const startTestServer = async (port) => {
  port = port || 5054;
  const { startServer } = require(
    (0, utils_esbuild_1.excludeInBundle)('@goldstack/utils-aws-http-api-local'),
  );
  testServer = await startServer({
    port: port,
    routesDir: './src/routes',
    cors,
  });
  testServerPort = port;
  return testServer;
};
exports.startTestServer = startTestServer;
/**
 * Stops the test server if it's running.
 *
 * @returns A promise that resolves when the server has been stopped.
 */
const stopTestServer = async () => {
  if (!testServer) {
    return;
  }
  return testServer.shutdown();
};
exports.stopTestServer = stopTestServer;
/**
 * Gets the endpoint URL for the API deployment.
 *
 * @param deploymentName - Optional name of the deployment to use. If not provided,
 *                         uses the deployment specified in environment variables.
 * @returns The endpoint URL string.
 * @throws {Error} If the deployment cannot be found.
 */
const getEndpoint = (deploymentName) => {
  if (!deploymentName) {
    deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
  }
  if (deploymentName === 'local') {
    const port = testServerPort || 5054;
    return `http://localhost:${port}`;
  }
  const deployment = goldstack_json_1.default.deployments.find(
    (deployment) => deployment.name === deploymentName,
  );
  if (!deployment) {
    throw new Error(`Cannot find deployment with name ${deploymentName}`);
  }
  return `https://${deployment.configuration.apiDomain}`;
};
exports.getEndpoint = getEndpoint;
//# sourceMappingURL=module.js.map
