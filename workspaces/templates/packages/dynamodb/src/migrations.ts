import { InputMigrations } from 'umzug/lib/types';
import { DynamoDBContext } from '@goldstack/template-dynamodb';

import { marshall } from '@aws-sdk/util-dynamodb';

export const createMigrations = (): InputMigrations<DynamoDBContext> => {
  return [
    {
      name: '00-dummy-migration',
      async up({ context }) {
        await context.client
          .putItem({
            TableName: context.tableName,
            Item: marshall({
              pk: '#DUMMY',
              sk: 'hello-world',
            }),
          })
          .promise();
      },
      async down({ context }) {
        await context.client
          .deleteItem({
            TableName: context.tableName,
            Key: marshall({
              pk: '#DUMMY',
              sk: 'hello-world',
            }),
          })
          .promise();
      },
    },
  ];
};
