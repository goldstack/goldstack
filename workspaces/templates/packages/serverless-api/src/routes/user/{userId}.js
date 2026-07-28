'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.handler = void 0;
const handler = async (event, _context) => {
  var _a;
  const userId =
    ((_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.userId) || 'not specified';
  return {
    statusCode: 201,
    body: JSON.stringify({
      message: `Showing user [${userId}]`,
    }),
  };
};
exports.handler = handler;
//# sourceMappingURL=%7BuserId%7D.js.map
