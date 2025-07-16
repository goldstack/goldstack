import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Handler } from 'aws-lambda';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

export const handler: ProxyHandler = async (event, context) => {
  const id = event.pathParameters?.['id'] || 'not specified';

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: `Accessing order [${id}]`,
    }),
  };
};
