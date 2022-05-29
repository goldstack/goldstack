import { Handler, APIGatewayProxyEventV2 } from 'aws-lambda';

type ProxyHandler = Handler<APIGatewayProxyEventV2, any>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: ProxyHandler = async (event, context) => {
  const message = event.queryStringParameters?.message || 'no message';

  if (!res.Body) {
    throw new Error('Cannot find test.txt');
  }
  return {
    message: `${message + ' ' + res.Body.toString()}`,
  };
};
