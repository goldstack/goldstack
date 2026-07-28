'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.getEndpoint = exports.stopTestServer = exports.startTestServer = void 0;
const utils_log_1 = require('@goldstack/utils-log');
const goldstack_json_1 = __importDefault(require('./../goldstack.json'));
let testServerPort = null;
let testServer = null;
const startTestServer = async (port) => {
  const usePort = port !== null && port !== void 0 ? port : 0;
  (0, utils_log_1.debug)(`Starting test server on port ${usePort === 0 ? '(auto)' : usePort}...`);
  // The below is preventing webpack from bundling up the server - it is only required for local tests.
  // biome-ignore lint/security/noGlobalEval: Required for test server isolation
  testServer = await eval(
    `var server = require('./server.ts'); var promise = server.start(${usePort}); promise;`,
  );
  const addr = testServer === null || testServer === void 0 ? void 0 : testServer.address();
  testServerPort = typeof addr === 'object' && addr ? addr.port : usePort;
  (0, utils_log_1.debug)(`Test server started on port ${testServerPort}`);
};
exports.startTestServer = startTestServer;
const stopTestServer = async () => {
  return new Promise((resolve, reject) => {
    if (!testServer) {
      (0, utils_log_1.debug)('No test server to stop');
      resolve();
      return;
    }
    (0, utils_log_1.debug)(`Stopping test server on port ${testServerPort}...`);
    if (typeof testServer.closeAllConnections === 'function') {
      testServer.closeAllConnections();
    }
    testServer.close((err) => {
      if (err) {
        (0, utils_log_1.debug)(`Error stopping test server: ${err.message}`);
        reject(err);
        return;
      }
      (0, utils_log_1.debug)('Test server stopped');
      resolve();
    });
  });
};
exports.stopTestServer = stopTestServer;
const getEndpoint = (deploymentName) => {
  if (!deploymentName) {
    deploymentName = process.env.GOLDSTACK_DEPLOYMENT;
  }
  if (deploymentName === 'local') {
    const port = testServerPort;
    return `http://localhost:${port || '8731'}`;
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
