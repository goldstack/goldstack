import { DeleteItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import type { DynamoDBContext } from '@goldstack/template-dynamodb';
import {
  createGsi,
  deleteGsi,
  getExistingAttributes,
  gsiExists,
} from '@goldstack/template-dynamodb-cli';
import { debug, error } from '@goldstack/utils-log';
import type { InputMigrations } from 'umzug/lib/types';

/**
 * Umzug migrations applied during connection see https://github.com/sequelize/umzug#migrations
 */
export const createMigrations = (): InputMigrations<DynamoDBContext> => {
  return [
    {
      name: '00-dummy-migration',
      async up({ context }) {
        await context.client.send(
          new PutItemCommand({
            TableName: context.tableName,
            Item: {
              pk: { S: '#DUMMY' },
              sk: { S: 'hello-world-again' },
            },
          }),
        );
      },
      async down({ context }) {
        await context.client.send(
          new DeleteItemCommand({
            TableName: context.tableName,
            Key: {
              pk: { S: '#DUMMY' },
              sk: { S: 'hello-world' },
            },
          }),
        );
      },
    },
    {
      name: '01-add-gs1-email-index',
      async up({ context }) {
        try {
          debug('Starting migration 01-add-gs1-email-index');

          // Check if GSI already exists
          const exists = await gsiExists(context, 'gs1');
          if (exists) {
            debug('GSI gs1 already exists, skipping migration');
            return;
          }

          debug('GSI gs1 does not exist, proceeding with creation');

          // Get existing attributes
          const existingAttributes = await getExistingAttributes(context);
          debug(`Found ${existingAttributes.length} existing attribute definitions`);

          // Create the GSI
          await createGsi(context, 'gs1', existingAttributes);

          debug('Migration 01-add-gs1-email-index completed successfully');
        } catch (e) {
          error(`Error running migration 01-add-gs1-email-index: ${e.message}`, { error: e });
          throw e;
        }
      },
      async down({ context }) {
        try {
          debug('Starting migration 01-add-gs1-email-index down (deleting gs1)');

          // Check if GSI exists
          const exists = await gsiExists(context, 'gs1');
          if (!exists) {
            debug('GSI gs1 does not exist, skipping deletion');
            return;
          }

          debug('GSI gs1 exists, proceeding with deletion');

          // Delete the GSI
          await deleteGsi(context, 'gs1');

          debug('Migration 01-add-gs1-email-index down completed successfully');
        } catch (e) {
          error(`Error running migration 01-add-gs1-email-index down: ${e.message}`, { error: e });
          throw e;
        }
      },
    },
  ];
};
