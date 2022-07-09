import type {
  APIGatewayProxyResultV2,
  APIGatewayProxyEventV2,
} from 'aws-lambda';

import zlib from 'zlib';

export const compress = (
  event: APIGatewayProxyEventV2,
  result: APIGatewayProxyResultV2
): void => {
  const preferredEncodings = ['gzip', 'deflate'];

  const acceptEncodingHeader = event.headers['accept-encoding'];

  // determine accepted encodings
  const encodings: Set<string> = new Set();
  preferredEncodings.forEach((encoding) => {
    encodings.add(encoding);
  });
  if (acceptEncodingHeader) {
    acceptEncodingHeader.split(',').forEach((encoding) => {
      encodings.add(encoding.toLowerCase().trim());
    });
  }
};
