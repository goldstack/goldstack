import { read } from '@goldstack/utils-sh';
import { existsSync } from 'fs';
import { posix, resolve } from 'path';
import { connect, deleteTable, migrateDownTo } from './templateDynamoDBTable';

const loadMigrations = (): any => {
  const jsPath = resolve(
    `${posix.dirname(process.cwd())}/dist/src/migrations.js`
  );
  if (existsSync(jsPath)) {
    return require(jsPath);
  }
  const tsPath = resolve(`${posix.dirname(process.cwd())}/src/migrations.ts`);
  if (existsSync(tsPath)) {
    return require(tsPath);
  }
  throw new Error(`Cannot find migrations file at ${jsPath} or ${tsPath}`);
};

export const dynamoDBCli = async (args: string[]): Promise<void> => {
  const goldstackConfig = JSON.parse(read(`${process.cwd()}/goldstack.json`));
  const packageSchema = JSON.parse(
    read(`${process.cwd()}/schemas/package.schema.json`)
  );
  const migrations = loadMigrations().createMigrations();
  if (args[0] === 'init') {
    await connect({
      goldstackConfig,
      packageSchema,
      migrations,
      deploymentName: args[1],
    });
    return;
  }
  if (args[0] === 'delete') {
    await deleteTable({
      goldstackConfig,
      packageSchema,
      deploymentName: args[1],
    });
    return;
  }
  if (args[0] === 'migrate-to') {
    await migrateDownTo({
      goldstackConfig,
      packageSchema,
      migrations,
      migrationName: args[2],
      deploymentName: args[1],
    });
    return;
  }
  throw new Error(`Unknown DynamoDB table command: ${args[0]}`);
};
