'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const template_dynamodb_cli_1 = require('@goldstack/template-dynamodb-cli');
const migrations_1 = require('./migrations');
require('source-map-support').install();
(0, template_dynamodb_cli_1.run)({
  args: process.argv,
  migrations: (0, migrations_1.createMigrations)(),
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
//# sourceMappingURL=template.js.map
