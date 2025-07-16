import type { APIGatewayProxyEventV2, Handler } from 'aws-lambda';

type ProxyHandler = Handler<APIGatewayProxyEventV2, string>;

export const handler: ProxyHandler = async (event, context) => {
  const id = event.pathParameters?.['id'] || 'not specified';

  return JSON.stringify({
    message: `Accessing order [${id}]`,
  });
};
