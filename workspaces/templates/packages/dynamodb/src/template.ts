import { run } from '@goldstack/template-dynamodb-cli';
import { createMigrations } from './migrations';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();

run({ args: process.argv, migrations: createMigrations() }).catch((e) => {
  console.error(e);
  process.exit(1);
});
