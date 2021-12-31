import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: ProxyHandler = async (event, context) => {
  const sessionId = event.pathParameters?.['sessionId'] || 'not specified';

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: `Accessing items for cart [${sessionId}]`,
    }),
  };
};
