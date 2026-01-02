import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Handler } from 'aws-lambda';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

export const handler: ProxyHandler = async (event, _context) => {
  const message = event.queryStringParameters?.message || 'no message';

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: `${message}`,
    }),
  };
};
