import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';

import zlib from 'zlib';

export const compress = (
  event: APIGatewayProxyEventV2,
  result: APIGatewayProxyStructuredResultV2
): APIGatewayProxyStructuredResultV2 => {
  // when there is no body, there is nothing to compress
  if (!result.body) {
    return result;
  }

  const acceptEncodingHeader = event.headers['accept-encoding'];

  // determine accepted encodings
  const encodings: Set<string> = new Set();
  if (acceptEncodingHeader) {
    acceptEncodingHeader.split(',').forEach((encoding) => {
      encodings.add(encoding.toLowerCase().trim());
    });
  }

  if (!result.headers) {
    result.headers = {};
  }
  if (encodings.has('br')) {
    result.headers['content-encoding'] = 'br';
    result.isBase64Encoded = true;
    result.body = zlib.brotliCompressSync(result.body).toString('base64');
    return result;
  }

  if (encodings.has('gzip')) {
    result.headers['content-encoding'] = 'gzip';
    result.isBase64Encoded = true;
    result.body = zlib.gzipSync(result.body).toString('base64');
    return result;
  }

  if (encodings.has('deflate')) {
    result.headers['content-encoding'] = 'deflate ';
    result.isBase64Encoded = true;
    result.body = zlib.deflateSync(result.body).toString('base64');
    return result;
  }

  // if there are no supported encodings, return unencoded message
  return result;
};
