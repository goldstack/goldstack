import type { APIGatewayProxyEventV2, Handler } from 'aws-lambda';

type ProxyHandler = Handler<APIGatewayProxyEventV2, any>;

export const handler: ProxyHandler = async (event, context) => {
  return {
    message: 'Unknown endpoint',
  };
};
