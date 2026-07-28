'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.handler = void 0;
const handler = async (event, _context) => {
  if (event.requestContext.http.method === 'GET') {
    return {
      statusCode: 201,
      body: JSON.stringify({
        users: ['1', '2'],
      }),
    };
  }
  return {
    statusCode: 201,
    body: JSON.stringify({
      message: 'Not supported',
    }),
  };
};
exports.handler = handler;
//# sourceMappingURL=$index.js.map
