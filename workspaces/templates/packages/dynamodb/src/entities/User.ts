import {
  boolean,
  Entity,
  type InputValue,
  item,
  string,
  type TransformedValue,
  type ValidValue,
} from 'dynamodb-toolbox';

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
      sk: 'USER',
    }),
  });

  return entity;
}
