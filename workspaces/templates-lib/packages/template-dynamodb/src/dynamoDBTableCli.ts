import { read } from '@goldstack/utils-sh';
import { existsSync } from 'fs';
import { posix, resolve } from 'path';
import { InputMigrations } from 'umzug/lib/types';
import { DynamoDBContext } from './dynamoDBMigrations';
import { connect, deleteTable, migrateDownTo } from './templateDynamoDBTable';

export const dynamoDBCli = async (
  migrations: InputMigrations<DynamoDBContext>,
  args: string[]
): Promise<void> => {
  const goldstackConfig = JSON.parse(read(`${process.cwd()}/goldstack.json`));
  const packageSchema = JSON.parse(
    read(`${process.cwd()}/schemas/package.schema.json`)
  );
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
