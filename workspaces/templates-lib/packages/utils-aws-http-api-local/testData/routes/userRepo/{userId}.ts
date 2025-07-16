import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Handler } from 'aws-lambda';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

export const handler: ProxyHandler = async (event, context) => {
  const userId = event.pathParameters?.['userId'] || 'not specified';

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: `Showing user [${userId}]`,
    }),
  };
};
