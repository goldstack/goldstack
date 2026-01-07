import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Handler } from 'aws-lambda';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

export const handler: ProxyHandler = async (event, _context) => {
  const path = event.pathParameters?.proxy || 'not specified';

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: `Accessing path in admin [${path}]`,
    }),
  };
};
