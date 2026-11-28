import type {
  CloudFrontRequest,
  CloudFrontRequestCallback,
  CloudFrontRequestEvent,
  CloudFrontResultResponse,
  Context,
} from 'aws-lambda';

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
  event: CloudFrontRequestEvent,
  _context: Context,
  callback: CloudFrontRequestCallback,
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
      callback(null, permanentRedirect(request, uri.substring(0, uri.length - 1)));
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

/**
 * Creates a 308 redirect response that preserves the original query string.
 *
 * The location is relative to the request URL because at the origin-request
 * event the `Host` header contains the origin host (for example the S3 bucket)
 * rather than the viewer's domain.
 *
 * @param request - The incoming CloudFront request.
 * @param uri - The canonical URI without the trailing slash.
 * @returns The redirect response.
 */
function permanentRedirect(request: CloudFrontRequest, uri: string): CloudFrontResultResponse {
  const query = request.querystring;

  return {
    status: '308',
    statusDescription: 'Permanent Redirect',
    headers: {
      location: [
        {
          key: 'Location',
          value: `${uri}${query ? `?${query}` : ''}`,
        },
      ],
    },
  };
}
