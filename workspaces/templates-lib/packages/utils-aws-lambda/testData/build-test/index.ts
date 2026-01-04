import type { APIGatewayProxyEventV2, Handler } from 'aws-lambda';

type ProxyHandler = Handler<APIGatewayProxyEventV2, any>;

export const handler: ProxyHandler = async (event, _context) => {
  const message = event.queryStringParameters?.message || 'no message';

  return {
    message: `${message}`,
  };
};
