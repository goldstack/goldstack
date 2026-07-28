'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.createMigrations = void 0;
const client_dynamodb_1 = require('@aws-sdk/client-dynamodb');
const template_dynamodb_cli_1 = require('@goldstack/template-dynamodb-cli');
const utils_log_1 = require('@goldstack/utils-log');
/**
 * Umzug migrations applied during connection see https://github.com/sequelize/umzug#migrations
 */
const createMigrations = () => {
  return [
    {
      name: '00-dummy-migration',
      async up({ context }) {
        await context.client.send(
          new client_dynamodb_1.PutItemCommand({
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
          new client_dynamodb_1.DeleteItemCommand({
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
          (0, utils_log_1.debug)('Starting migration 01-add-gs1-email-index');
          // Check if GSI already exists
          const exists = await (0, template_dynamodb_cli_1.gsiExists)(context, 'gs1');
          if (exists) {
            (0, utils_log_1.debug)('GSI gs1 already exists, skipping migration');
            return;
          }
          (0, utils_log_1.debug)('GSI gs1 does not exist, proceeding with creation');
          // Get existing attributes
          const existingAttributes = await (0, template_dynamodb_cli_1.getExistingAttributes)(
            context,
          );
          (0, utils_log_1.debug)(
            `Found ${existingAttributes.length} existing attribute definitions`,
          );
          // Create the GSI
          await (0, template_dynamodb_cli_1.createGsi)(context, 'gs1', existingAttributes);
          (0, utils_log_1.debug)('Migration 01-add-gs1-email-index completed successfully');
        } catch (e) {
          (0, utils_log_1.error)(`Error running migration 01-add-gs1-email-index: ${e.message}`, {
            error: e,
          });
          throw e;
        }
      },
      async down({ context }) {
        try {
          (0, utils_log_1.debug)('Starting migration 01-add-gs1-email-index down (deleting gs1)');
          // Check if GSI exists
          const exists = await (0, template_dynamodb_cli_1.gsiExists)(context, 'gs1');
          if (!exists) {
            (0, utils_log_1.debug)('GSI gs1 does not exist, skipping deletion');
            return;
          }
          (0, utils_log_1.debug)('GSI gs1 exists, proceeding with deletion');
          // Delete the GSI
          await (0, template_dynamodb_cli_1.deleteGsi)(context, 'gs1');
          (0, utils_log_1.debug)('Migration 01-add-gs1-email-index down completed successfully');
        } catch (e) {
          (0, utils_log_1.error)(
            `Error running migration 01-add-gs1-email-index down: ${e.message}`,
            { error: e },
          );
          throw e;
        }
      },
    },
  ];
};
exports.createMigrations = createMigrations;
//# sourceMappingURL=migrations.js.map
