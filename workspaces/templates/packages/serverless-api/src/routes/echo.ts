import { Handler, APIGatewayProxyEventV2 } from 'aws-lambda';

import { connect, getBucketName } from '@goldstack/s3';

type ProxyHandler = Handler<APIGatewayProxyEventV2, any>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: ProxyHandler = async (event, context) => {
  const message = event.queryStringParameters?.message || 'no message';

  const s3 = await connect();
  await s3
    .putObject({
      Bucket: await getBucketName(),
      Key: 'text.txt',
      Body: '123',
    })
    .promise();
  return {
    message: `${message}`,
  };
};
