'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.handler = void 0;
const date_fns_1 = require('date-fns');
const handler = async (_event, _context) => {
  return {
    statusCode: 201,
    body: JSON.stringify({
      message: `Unknown endpoint accessed on a ${(0, date_fns_1.format)(new Date(), 'eeee')}`,
    }),
  };
};
exports.handler = handler;
//# sourceMappingURL=$default.js.map
