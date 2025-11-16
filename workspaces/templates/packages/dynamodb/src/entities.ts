import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import {
  boolean,
  Entity,
  type InputItem,
  type InputValue,
  schema,
  string,
  type TimestampsDefaultOptions,
  Table as ToolboxTable,
  type ValidItem,
  type ValidValue,
} from 'dynamodb-toolbox';

// ---
// Below find an example how to define an entity.
//
// Here we are defining the 'User' entity. You will most
// likely want to delete this declaration and replace
// it with your own types
// ---

export const UserSchema = schema({
  email: string().key().savedAs('pk'),
  type: string().key().default('user').savedAs('sk'),
  name: string().required(),
  emailVerified: boolean().required(),
});

export type InputUserValue = InputValue<typeof UserSchema>;

export type ValidUserValue = ValidValue<typeof UserSchema>;

export type InputUser = InputItem<UserEntity>;

export type ValidUser = ValidItem<UserEntity>;

export type UserEntity = Entity<
  'User',
  Table,
  typeof UserSchema,
  'entity',
  TimestampsDefaultOptions,
  true
>;

export function createUserEntity(table: Table): UserEntity {
  const entity = new Entity({
    name: 'User',
    schema: UserSchema,
    table: table,
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
