import { read } from '@goldstack/utils-sh';
import { connect, deleteTable, migrateDownTo } from './templateDynamoDBTable';

export const dynamoDBCli = async (args: string[]): Promise<void> => {
  const goldstackConfig = JSON.parse(read(`${process.cwd()}/goldstack.json`));
  const packageSchema = JSON.parse(
    read(`${process.cwd()}/schemas/package.schema.json`)
  );
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const migrations = require(`${process.cwd()}/src/migrations`).createMigrations();
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
