import { Table } from 'dynamodb-toolbox';
import DynamoDB from 'aws-sdk/clients/dynamodb';

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

export const UserEntity = {
  name: 'User',
  attributes: {
    pk: { partitionKey: true },
    sk: { hidden: true, sortKey: true },
    name: { type: 'string', required: true },
    emailVerified: { type: 'boolean', required: true },
  },
};
