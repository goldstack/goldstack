import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: ProxyHandler = async (event, context) => {
  const message =
    (event.body && JSON.parse(event.body).message) ?? 'no message';

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: `${message}`,
    }),
    headers: { location: '/echoBody' },
  };
};
