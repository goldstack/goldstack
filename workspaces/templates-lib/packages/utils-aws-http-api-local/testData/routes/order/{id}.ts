import { Handler, APIGatewayProxyEventV2 } from 'aws-lambda';

type ProxyHandler = Handler<APIGatewayProxyEventV2, string>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: ProxyHandler = async (event, context) => {
  const id = event.pathParameters?.['id'] || 'not specified';

  return JSON.stringify({
    message: `Accessing order [${id}]`,
  });
};
