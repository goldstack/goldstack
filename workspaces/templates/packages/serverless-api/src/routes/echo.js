'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.handler = void 0;
const handler = async (event, _context) => {
  var _a;
  const message =
    ((_a = event.queryStringParameters) === null || _a === void 0 ? void 0 : _a.message) ||
    'no message';
  return {
    message: `${message}`,
  };
};
exports.handler = handler;
//# sourceMappingURL=echo.js.map
