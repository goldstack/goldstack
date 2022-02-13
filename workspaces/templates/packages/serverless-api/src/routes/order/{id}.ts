import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: ProxyHandler = async (event, context) => {
  const id = event.pathParameters?.['id'] || 'not specified';

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: `Accessing order [${id}]`,
    }),
  };
};
