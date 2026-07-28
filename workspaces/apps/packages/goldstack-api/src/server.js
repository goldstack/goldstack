'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.start = exports.app = void 0;
const cookie_parser_1 = __importDefault(require('cookie-parser'));
const cors_1 = __importDefault(require('cors'));
const express_1 = __importDefault(require('express'));
const helmet_1 = __importDefault(require('helmet'));
const utils_log_1 = require('@goldstack/utils-log');
const projects_1 = __importDefault(require('./projects'));
const sessions_1 = __importDefault(require('./sessions'));
exports.app = (0, express_1.default)();
(0, utils_log_1.debug)('Server cold start');
exports.app.use((0, helmet_1.default)());
(0, utils_log_1.debug)(`CORS config: ${process.env.CORS}`);
exports.app.use((0, cors_1.default)({ origin: process.env.CORS, credentials: true }));
exports.app.use((0, cookie_parser_1.default)());
exports.app.use(express_1.default.json({ limit: '10mb' }));
// if (process.env.GOLDSTACK_DEPLOYMENT !== 'local') {
//   app.use(requestLogger());
// }
exports.app.get('/', (_req, res) => {
  res.send('Goldstack API');
});
exports.app.use('/projects', projects_1.default);
exports.app.use('/sessions', sessions_1.default);
const start = async (port) => {
  return new Promise((resolve, reject) => {
    const server = exports.app.listen(port, () => {
      const addr = server.address();
      const actualPort = typeof addr === 'object' && addr ? addr.port : port;
      (0, utils_log_1.debug)(`Server started on port ${actualPort}`);
      resolve(server);
    });
    server.on('error', (err) => {
      (0, utils_log_1.debug)(`Server failed to start on port ${port}: ${err.message}`);
      reject(err);
    });
  });
};
exports.start = start;
//# sourceMappingURL=server.js.map
