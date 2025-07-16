import type { InputMigrations } from 'umzug/lib/types';
import type { DynamoDBContext } from '@goldstack/template-dynamodb';

import { DeleteItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';

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
          })
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
          })
        );
      },
    },
  ];
};
