/* esbuild-ignore ui */

import assert from 'assert';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Handler } from 'aws-lambda';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

export const handler: ProxyHandler = async (_event, _context) => {
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
