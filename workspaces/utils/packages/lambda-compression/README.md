[![npm version](https://badge.fury.io/js/lambda-compression.svg)](https://badge.fury.io/js/lambda-compression)

# Lambda HTTP Payload Compression

This library provides a wrapper that can be used to compress content in responses when using the [AWS HTTP API](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html).

The library supports compression with `br`, `gzip` and `deflate`. It will return responses with compressed data matching the supported `accept-encoding` header provided by the client.

## Installation

Simply add the `lambda-compression` package to your project:

```sh
npm add lambda-compression

# when using Yarn
yarn add lambda-compression
```

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

## How It Works

The `compress` function inspects the `accept-encoding` header from the incoming request to determine which compression algorithms the client supports. It prioritises encodings in the following order:

1. **Brotli** (`br`) - Most efficient compression
2. **Gzip** (`gzip`) - Widely supported
3. **Deflate** (`deflate`) - Basic compression

If a supported encoding is found, the response body is compressed using the corresponding algorithm, the `content-encoding` header is set, and the body is base64-encoded as required by AWS Lambda. If no supported encodings are present or the response has no body, the original result is returned unchanged.

## Supported Encodings

- `br` (Brotli): Offers the best compression ratio, ideal for modern browsers and clients.
- `gzip`: Balanced compression and speed, supported by most HTTP clients.
- `deflate`: Basic compression, less efficient but still useful for compatibility.

The library uses Node.js's built-in `zlib` module for compression.

## API Reference

### `compress(event, result)`

Compresses the response body based on the client's accepted encodings.

**Parameters:**
- `event` (APIGatewayProxyEventV2): The Lambda event object containing request headers.
- `result` (APIGatewayProxyStructuredResultV2): The response object to be compressed.

**Returns:** APIGatewayProxyStructuredResultV2 - The modified response with compressed body if applicable.

**Notes:**
- The response body must be a string. Binary data should not be passed directly.
- Compression only occurs if the body exists and a supported encoding is accepted.
- The function modifies the result object in place and returns it.

## Requirements and Limitations

- **Node.js Environment:** Requires Node.js with zlib support (available in AWS Lambda runtime).
- **Body Type:** Only string bodies are supported for compression. If your response contains binary data, handle encoding separately.
- **Performance:** Compression adds CPU overhead. For small responses (<1KB), compression may not provide benefits and could increase response size due to encoding.
- **Client Support:** Ensure clients send appropriate `accept-encoding` headers.

## Examples

### Basic JSON Response
```typescript
return compress(event, {
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello World' }),
});
```

### HTML Response
```typescript
return compress(event, {
  statusCode: 200,
  headers: { 'Content-Type': 'text/html' },
  body: '<html><body><h1>Hello</h1></body></html>',
});
```

### No Compression (Client doesn't support)
If the client sends `accept-encoding: identity` or no header, the response remains uncompressed.

## Also See

- [compression.js in lambda-api project](https://github.com/jeremydaly/lambda-api/blob/main/lib/compression.js)
- [Serverless Content Encoding for Serverless](https://www.npmjs.com/package/serverless-content-encoding)
- [serverless-content-encoding](https://github.com/dong-dohai/serverless-content-encoding) - no longer maintained

This utility has been developed for the [Goldstack](https://goldstack.party) starter project builder. Check it out for starting your next project ❤️
