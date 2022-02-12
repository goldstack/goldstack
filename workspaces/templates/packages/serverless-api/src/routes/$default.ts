import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

import { format } from 'date-fns';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: ProxyHandler = async (event, context) => {
  return {
    statusCode: 201,
    body: JSON.stringify({
      message: `Unknown endpoint accessed on a ${format(new Date(), 'eeee')}`,
    }),
  };
};
