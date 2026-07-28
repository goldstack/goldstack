'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.UserSchema = void 0;
exports.createUserEntity = createUserEntity;
const dynamodb_toolbox_1 = require('dynamodb-toolbox');
/**
 * Schema for User entity that defines user metadata
 */
exports.UserSchema = (0, dynamodb_toolbox_1.item)({
  userId: (0, dynamodb_toolbox_1.string)().key(),
  name: (0, dynamodb_toolbox_1.string)().required(),
  email: (0, dynamodb_toolbox_1.string)().required(),
  emailVerified: (0, dynamodb_toolbox_1.boolean)().required(),
  gs1_pk: (0, dynamodb_toolbox_1.string)()
    .optional()
    .link((item) => {
      const user = item;
      return user.email ? `EMAIL#${user.email}` : undefined;
    }),
  gs1_sk: (0, dynamodb_toolbox_1.string)()
    .optional()
    .link((item) => {
      const user = item;
      return user.userId ? `${user.userId}` : undefined;
    }),
});
/**
 * Creates a new User entity for the given DynamoDB table
 * @param table The DynamoDB table to create the entity for
 * @returns A new User entity
 */
function createUserEntity(table) {
  const entity = new dynamodb_toolbox_1.Entity({
    name: 'User',
    schema: exports.UserSchema,
    table: table,
    computeKey: ({ userId }) => ({
      pk: `USER#${userId}`,
      sk: 'USER',
    }),
  });
  return entity;
}
//# sourceMappingURL=User.js.map
