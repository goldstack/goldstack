import {
  connect as templateConnect,
  getTableName as templateGetTableName,
} from '@goldstack/template-dynamodb';

import DynamoDB from 'aws-sdk/clients/dynamodb';
import goldstackConfig from './../goldstack.json';
import goldstackSchema from './../schemas/package.schema.json';

export const connect = async (deploymentName?: string): Promise<DynamoDB> => {
  return await templateConnect(
    goldstackConfig,
    goldstackSchema,
    deploymentName
  );
};

export const getTableName = async (
  deploymentName?: string
): Promise<string> => {
  return await templateGetTableName(
    goldstackConfig,
    goldstackSchema,
    deploymentName
  );
};
