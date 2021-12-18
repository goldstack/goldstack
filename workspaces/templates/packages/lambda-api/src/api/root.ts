import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

export const helloFromLambdaHandler: ProxyHandler = async (event, context) => {
  const name = event.queryStringParameters?.name || 'world';

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: `Hello ${name}`,
    }),
  };
};
