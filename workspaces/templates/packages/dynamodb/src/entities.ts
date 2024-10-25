import { boolean, Entity, schema, string, Table } from 'dynamodb-toolbox';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import memoizee from 'memoizee';
import { Key } from 'dynamodb-toolbox/dist/esm/table/types';

export function createTable(
  dynamoDB: DynamoDBDocumentClient,
  tableName: string
): Table<Key<string, 'string'>, Key<string, 'string'>> {
  const table = new Table({
    name: tableName,
    partitionKey: {
      name: 'pk',
      type: 'string',
    },
    sortKey: {
      name: 'sk',
      type: 'string',
    },
    documentClient: dynamoDB,
  });
  return table;
}

export function UserEntityFn(
  table: Table<Key<string, 'string'>, Key<string, 'string'>>
) {
  const entity = new Entity({
    name: 'User',
    schema: schema({
      email: string().key().savedAs('pk'),
      type: string().key().default('user').savedAs('sk'),
      name: string().required(),
      emailVerified: boolean().required(),
    }),
    table: table,
  } as const);

  return entity;
}

export const UserEntity = memoizee(UserEntityFn);
