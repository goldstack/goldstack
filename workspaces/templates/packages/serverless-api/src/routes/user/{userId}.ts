import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

import { connect, getTableName } from '@goldstack/dynamodb';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: ProxyHandler = async (event, context) => {
  const userId = event.pathParameters?.['userId'] || 'not specified';

  const client = await connect();

  const res = await client
    .scan({
      TableName: await getTableName(),
    })
    .promise();

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: `Showing user [${userId}] ${res.Count}`,
    }),
  };
};
