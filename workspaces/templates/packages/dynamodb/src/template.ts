import { run } from '@goldstack/template-dynamodb';
import { createMigrations } from './migrations';

run({ args: process.argv, migrations: createMigrations() }).catch((e) => {
  console.log(e);
  process.exit(1);
});
