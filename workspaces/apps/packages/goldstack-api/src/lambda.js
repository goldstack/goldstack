'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
require('source-map-support').install();
const aws_serverless_express_1 = __importDefault(require('aws-serverless-express'));
const server_1 = require('./server');
const server = aws_serverless_express_1.default.createServer(server_1.app);
exports.handler = (
  // biome-ignore lint/suspicious/noExplicitAny: AWS Lambda event and context types are complex and vary
  event,
  // biome-ignore lint/suspicious/noExplicitAny: AWS Lambda event and context types are complex and vary
  context,
) => {
  aws_serverless_express_1.default.proxy(server, event, context);
};
//# sourceMappingURL=lambda.js.map
