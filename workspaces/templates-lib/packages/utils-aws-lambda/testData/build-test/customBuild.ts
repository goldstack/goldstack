import type { APIGatewayProxyEventV2, Handler } from 'aws-lambda';

type ProxyHandler = Handler<APIGatewayProxyEventV2, any>;

export const handler: ProxyHandler = async (_event, _context) => {
  return {
    message: 'Hi',
  };
};
