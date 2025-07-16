/* esbuild-ignore ui */

import assert from 'assert';
import type {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: ProxyHandler = async (event, context) => {
  assert('Can use Node.js built in functions' !== undefined);
  return {
    body: `User-agent: *
${process.env.GOLDSTACK_DEPLOYMENT !== 'prod' ? 'Disallow: /' : ''}`,
    headers: {
      'Content-Type': 'text/plain',
    },
    statusCode: 200,
  };
};
