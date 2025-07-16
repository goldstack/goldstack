import { run } from '@goldstack/template-dynamodb-cli';
import { createMigrations } from './migrations';

require('source-map-support').install();

run({ args: process.argv, migrations: createMigrations() }).catch((e) => {
  console.error(e);
  process.exit(1);
});
