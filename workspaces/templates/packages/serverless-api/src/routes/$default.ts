import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Handler } from 'aws-lambda';

import { format } from 'date-fns';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

export const handler: ProxyHandler = async (event, context) => {
  return {
    statusCode: 201,
    body: JSON.stringify({
      message: `Unknown endpoint accessed on a ${format(new Date(), 'eeee')}`,
    }),
  };
};
