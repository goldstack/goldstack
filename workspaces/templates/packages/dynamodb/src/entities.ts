import { Entity, Table } from 'dynamodb-toolbox';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import memoizee from 'memoizee';

export function createTable<Name extends string>(
  dynamoDB: DynamoDB.DocumentClient,
  tableName: string
): Table<Name, 'pk', 'sk'> {
  return new Table({
    name: tableName,
    partitionKey: 'pk',
    sortKey: 'sk',
    DocumentClient: dynamoDB,
  });
}

export function UserEntityFn(table: Table<string, 'pk', 'sk'>) {
  return new Entity({
    name: 'User',
    attributes: {
      email: { partitionKey: true },
      type: { sortKey: true, default: 'user' },
      name: { type: 'string', required: true },
      emailVerified: { type: 'boolean', required: true },
    },
    table,
  } as const);
}

export const UserEntity = memoizee(UserEntityFn);
