import type { Handler, APIGatewayProxyEventV2 } from 'aws-lambda';

type ProxyHandler = Handler<APIGatewayProxyEventV2, any>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: ProxyHandler = async (event, context) => {
  return {
    message: 'Hi',
  };
};
