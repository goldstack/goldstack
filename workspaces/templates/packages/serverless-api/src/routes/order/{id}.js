'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.handler = void 0;
const handler = async (event, _context) => {
  var _a;
  const id =
    ((_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.id) || 'not specified';
  return {
    statusCode: 201,
    body: JSON.stringify({
      message: `Accessing order [${id}]`,
    }),
  };
};
exports.handler = handler;
//# sourceMappingURL=%7Bid%7D.js.map
