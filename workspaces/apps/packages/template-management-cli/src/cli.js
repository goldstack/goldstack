'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
/* eslint-disable @typescript-eslint/no-var-requires */
require('source-map-support').install();
const templateManagementCli_1 = require('./templateManagementCli');
(0, templateManagementCli_1.run)()
  .catch((e) => {
    throw new Error(`CLI command failed: ${e.message}`, e);
  })
  .then(() => {});
//# sourceMappingURL=cli.js.map
