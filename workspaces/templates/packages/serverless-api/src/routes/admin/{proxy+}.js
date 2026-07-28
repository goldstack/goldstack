'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.handler = void 0;
const handler = async (event, _context) => {
  var _a;
  const path =
    ((_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.proxy) || 'not specified';
  return {
    statusCode: 201,
    body: JSON.stringify({
      message: `Accessing path in admin [${path}]`,
    }),
  };
};
exports.handler = handler;
//# sourceMappingURL=%7Bproxy+%7D.js.map
