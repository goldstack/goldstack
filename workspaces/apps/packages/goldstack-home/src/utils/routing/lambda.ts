/**
 * Routes requests for a statically exported Next.js application served from S3
 * through CloudFront.
 *
 * A static export emits every page as `<path>.html` (with the default
 * `trailingSlash: false`), so the mapping is deterministic and no routes
 * manifest is needed. This keeps the packaged function size independent of the
 * number of pages.
 */
export const handler = (
  // biome-ignore lint/suspicious/noExplicitAny: AWS Lambda event type is complex
  event: any,
  // biome-ignore lint/suspicious/noExplicitAny: AWS Lambda context type is complex
  _context: any,
  // biome-ignore lint/suspicious/noExplicitAny: AWS Lambda callback type is complex
  callback: any,
): void => {
  const request = event.Records[0].cf.request;
  const uri = request.uri;

  if (uri === '' || uri === '/') {
    request.uri = '/index.html';
    callback(null, request);
    return;
  }

  if (uri.charAt(uri.length - 1) === '/') {
    // Mirror Next.js' internal `/:path+/` -> `/:path+` redirect. Only a single
    // trailing slash is removed and the root path is never redirected.
    if (uri.charAt(uri.length - 2) !== '/') {
      const query = request.querystring;
      callback(null, {
        status: '308',
        statusDescription: 'Permanent Redirect',
        headers: {
          location: [
            {
              key: 'Location',
              value: `${uri.substring(0, uri.length - 1)}${query ? `?${query}` : ''}`,
            },
          ],
        },
      });
      return;
    }
    callback(null, request);
    return;
  }

  // Only the last path segment is checked for a file extension so that paths
  // such as `/v1.2/about` are still treated as pages.
  const lastSegment = uri.substring(uri.lastIndexOf('/') + 1);
  if (lastSegment.indexOf('.') === -1) {
    request.uri = `${uri}.html`;
  }

  callback(null, request);
};
