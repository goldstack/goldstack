import type { DynamoDBContext } from '@goldstack/template-dynamodb';
import { connect, deleteTable, migrateDownTo, tableExists } from '@goldstack/template-dynamodb';
import { read } from '@goldstack/utils-sh';
import type { InputMigrations } from 'umzug/lib/types';

/**
 * Checks whether the DynamoDB table for the given deployment exists.
 *
 * @param deploymentName - The name of the deployment to check.
 * @returns {Promise<boolean>} `true` if the table exists, `false` if it has not been created yet.
 */
export const dynamoDBTableExists = async (deploymentName: string): Promise<boolean> => {
  const goldstackConfig = JSON.parse(read(`${process.cwd()}/goldstack.json`));
  const packageSchema = JSON.parse(read(`${process.cwd()}/schemas/package.schema.json`));
  return await tableExists({
    goldstackConfig,
    packageSchema,
    deploymentName,
  });
};

export const dynamoDBCli = async (
  migrations: InputMigrations<DynamoDBContext>,
  args: string[],
): Promise<void> => {
  const goldstackConfig = JSON.parse(read(`${process.cwd()}/goldstack.json`));
  const packageSchema = JSON.parse(read(`${process.cwd()}/schemas/package.schema.json`));
  process.env.GOLDSTACK_DEPLOYMENT = args[1];
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
