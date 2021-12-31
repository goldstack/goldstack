import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: ProxyHandler = async (event, context) => {
  if (event.requestContext.http.method === 'GET') {
    return {
      statusCode: 201,
      body: JSON.stringify({
        users: ['1', '2'],
      }),
    };
  }
  return {
    statusCode: 201,
    body: JSON.stringify({
      message: 'Not supported',
    }),
  };
};
