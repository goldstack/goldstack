import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Table as ToolboxTable } from 'dynamodb-toolbox';
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
export declare function createTable(dynamoDB: DynamoDBDocumentClient, tableName: string): Table;
//# sourceMappingURL=entities.d.ts.map
