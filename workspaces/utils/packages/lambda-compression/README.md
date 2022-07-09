# Lambda HTTP Payload Compression

This library provides a wrapper that can be used to compress content in responses when using the [AWS HTTP API](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html).

The library supports compression with `br`, `gzip` and `deflate`. It will return responses with compressed data matching the supported `accept-encoding` header provided by the client.

## Usage

This library provides only one method `compress` that accepts two parameters with the respective types of `APIGatewayProxyEventV2` and `APIGatewayProxyStructuredResultV2` (for more details on these types, see [TypeScript Types for AWS Lambda](https://maxrohde.com/2022/01/02/typescript-types-for-aws-lambda/)).

Simply call the `compress` method as follows before returning the result of your Lambda.

```typescript
import { compress } from 'lambda-compression';

import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

export const handler: ProxyHandler = async (event, context) => {
  return compress(event, {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
    },
    body: '{"data":"hello"}',
  });
};
```

## Also See

- [compression.js in lambda-api project](https://github.com/jeremydaly/lambda-api/blob/main/lib/compression.js)
- [Serverless Content Encoding for Serverless](https://www.npmjs.com/package/serverless-content-encoding)
- [serverless-content-encoding](https://github.com/dong-dohai/serverless-content-encoding) - no longer maintained
