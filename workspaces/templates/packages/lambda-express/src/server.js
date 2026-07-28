'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require('cors'));
const express_1 = __importDefault(require('express'));
const helmet_1 = __importDefault(require('helmet'));
const root_1 = require('./root');
exports.app = (0, express_1.default)();
exports.app.use((0, helmet_1.default)());
if (process.env.CORS) {
  console.info(`Starting server with CORS domain: ${process.env.CORS}`);
  exports.app.use((0, cors_1.default)({ origin: process.env.CORS, credentials: true }));
}
exports.app.use(express_1.default.json());
exports.app.get('/', root_1.rootHandler);
//# sourceMappingURL=server.js.map
