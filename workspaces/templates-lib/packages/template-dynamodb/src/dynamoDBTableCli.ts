import { read } from '@goldstack/utils-sh';
import { existsSync } from 'fs';
import { posix, resolve } from 'path';
import { connect, deleteTable, migrateDownTo } from './templateDynamoDBTable';

const loadMigrations = (): any => {
  console.log('current work dir', process.cwd());
  const currentWorkDirPosix = posix.normalize(process.cwd());
  console.log('current work dir posix', currentWorkDirPosix);
  const jsPath = resolve(`${currentWorkDirPosix}/dist/src/migrations.js`);
  console.log('js path', jsPath);
  if (existsSync(jsPath)) {
    return require(jsPath);
  }
  const tsPath = resolve(`${currentWorkDirPosix}/src/migrations.ts`);
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
