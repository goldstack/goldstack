'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.handler = void 0;
const handler = async (event, _context) => {
  var _a;
  const sessionId =
    ((_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.sessionId) ||
    'not specified';
  return {
    statusCode: 201,
    body: JSON.stringify({
      message: `Accessing items for cart [${sessionId}]`,
    }),
  };
};
exports.handler = handler;
//# sourceMappingURL=items.js.map
