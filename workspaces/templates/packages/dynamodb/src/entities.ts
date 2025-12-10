import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import {
  boolean,
  Entity,
  type InputValue,
  item,
  string,
  Table as ToolboxTable,
  type TransformedValue,
  type ValidValue,
} from 'dynamodb-toolbox';

// ---
// Below find an example how to define an entity.
//
// Here we are defining the 'User' entity. You will most
// likely want to delete this declaration and replace
// it with your own types
// ---

/**
 * Schema for User entity that defines user metadata
 */
export const UserSchema = item({
  userId: string().key(),
  name: string().required(),
  email: string().required(),
  emailVerified: boolean().required(),
});

export type InputUserValue = InputValue<typeof UserSchema>;

export type ValidUserValue = ValidValue<typeof UserSchema>;

export type TransformedUserValue = TransformedValue<typeof UserSchema>;

export type ValidUser = ValidUserValue & { entity: 'User' };

/**
 * Creates a new User entity for the given DynamoDB table
 * @param table The DynamoDB table to create the entity for
 * @returns A new User entity
 */
export function createUserEntity(table: Table) {
  const entity = new Entity({
    name: 'User',
    schema: UserSchema,
    table: table,
    computeKey: ({ userId }) => ({
      pk: `USER#${userId}`,
      sk: `self`,
    }),
  });

  return entity;
}

// ---
// The below provides the typing for the base table that underlies
// all entities.
//
// Here you will for instance add secondary indices.
// ---

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
