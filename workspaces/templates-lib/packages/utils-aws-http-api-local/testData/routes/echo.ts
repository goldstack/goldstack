import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: ProxyHandler = async (event, context) => {
  const message = event.queryStringParameters?.message || 'no message';

  // console.log('event');
  // console.log(JSON.stringify(event, null, 2));
  // console.log('context');
  // console.log(JSON.stringify(context, null, 2));

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: `${message}`,
    }),
  };
};
