'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.createTable = createTable;
const dynamodb_toolbox_1 = require('dynamodb-toolbox');
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
__exportStar(require('./entities/User'), exports);
function createTable(dynamoDB, tableName) {
  const table = new dynamodb_toolbox_1.Table({
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
//# sourceMappingURL=entities.js.map
