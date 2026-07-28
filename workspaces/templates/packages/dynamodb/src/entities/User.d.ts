import {
  type InputValue,
  Table as ToolboxTable,
  type TransformedValue,
  type ValidValue,
} from 'dynamodb-toolbox';
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
/**
 * Schema for User entity that defines user metadata
 */
export declare const UserSchema: any;
export type InputUserValue = InputValue<typeof UserSchema>;
export type ValidUserValue = ValidValue<typeof UserSchema>;
export type TransformedUserValue = TransformedValue<typeof UserSchema>;
export type ValidUser = ValidUserValue & {
  entity: 'User';
};
/**
 * Creates a new User entity for the given DynamoDB table
 * @param table The DynamoDB table to create the entity for
 * @returns A new User entity
 */
export declare function createUserEntity(table: Table): any;
//# sourceMappingURL=User.d.ts.map
