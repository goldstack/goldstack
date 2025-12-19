import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Table as ToolboxTable } from 'dynamodb-toolbox';

// ---
// Below find an example how to define an entity.
//
// Here we are defining the 'User' entity. You will most
// likely want to delete this declaration and replace
// it with your own types
// ---

// ---
// The below provides the typing for the base table that underlies
// all entities.
//
// Here you will for instance add secondary indices.
// ---

export * from './entities/User';

export type Table = ToolboxTable<
  {
    name: 'pk';
    type: 'string';
  },
  {
    name: 'sk';
    type: 'string';
  },
  {},
  '_et'
>;

export function createTable(dynamoDB: DynamoDBDocumentClient, tableName: string): Table {
  const table = new ToolboxTable({
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
