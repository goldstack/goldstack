import { Handler, APIGatewayProxyEventV2 } from 'aws-lambda';

import { connect, getBucketName } from '@goldstack/s3';

type ProxyHandler = Handler<APIGatewayProxyEventV2, any>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: ProxyHandler = async (event, context) => {
  const message = event.queryStringParameters?.message || 'no message';

  const s3 = await connect();
  const res = await s3
    .getObject({
      Bucket: await getBucketName(),
      Key: 'test.txt',
    })
    .promise();
  if (!res.Body) {
    throw new Error('Cannot find test.txt');
  }
  return {
    message: `${message + ' ' + res.Body.toString()}`,
  };
};
