/**
 * A single query string parameter in the CloudFront Functions request format.
 */
interface CloudFrontQueryStringEntry {
  /** The parameter value, which is already percent-encoded. */
  value: string;
  /** Multiple values supplied for the same parameter key. */
  multiValue?: { value: string }[];
}

/**
 * Query string parameters as provided by CloudFront Functions.
 */
interface CloudFrontQueryString {
  [key: string]: CloudFrontQueryStringEntry;
}

/**
 * Routes requests for a statically exported Next.js application served from S3
 * through CloudFront.
 *
 * A static export emits every page as `<path>.html` (with the default
 * `trailingSlash: false`), so the mapping is deterministic and no routes
 * manifest is needed. This keeps the packaged function size independent of the
 * number of pages and well below the 10 KB CloudFront Functions limit.
 *
 * We are using an outdated syntax here, since we are bundling with esbuild and
 * that cannot translate into es5. So we want to make its job as easy as
 * possible.
 *
 * CloudFront Functions expects this non-exported global `handler` function.
 */
// biome-ignore lint/correctness/noUnusedVariables: CloudFront Functions requires a global handler
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri === '' || uri === '/') {
    request.uri = '/index.html';
    return request;
  }

  if (uri.charAt(uri.length - 1) === '/') {
    // Mirror Next.js' internal `/:path+/` -> `/:path+` redirect. Only a single
    // trailing slash is removed and the root path is never redirected.
    if (uri.charAt(uri.length - 2) !== '/') {
      return permanentRedirect(request, uri.substring(0, uri.length - 1));
    }
    return request;
  }

  // Only the last path segment is checked for a file extension so that paths
  // such as `/v1.2/about` are still treated as pages.
  var lastSegment = uri.substring(uri.lastIndexOf('/') + 1);
  if (lastSegment.indexOf('.') === -1) {
    request.uri = uri + '.html';
  }

  return request;
}

/**
 * Creates a 308 redirect response with an absolute location and the original
 * query string.
 *
 * @param request - The incoming CloudFront request.
 * @param uri - The canonical URI without the trailing slash.
 * @returns The redirect response.
 */
function permanentRedirect(request, uri) {
  var host = request.headers.host ? request.headers.host.value : '';
  var query = buildQueryString(request.querystring);
  var location = 'https://' + host + uri + (query ? '?' + query : '');

  return {
    statusCode: 308,
    statusDescription: 'Permanent Redirect',
    headers: {
      location: {
        value: location,
      },
    },
  };
}

/**
 * Rebuilds the query string from the parsed CloudFront representation without
 * re-encoding the already encoded values.
 *
 * @param params - The parsed CloudFront query string.
 * @returns The query string without a leading question mark.
 */
function buildQueryString(params: CloudFrontQueryString) {
  var parts: string[] = [];
  var keys = Object.keys(params || {});
  var i = 0;
  var j = 0;
  var key: string;
  var entry: CloudFrontQueryStringEntry;

  for (; i < keys.length; i++) {
    key = keys[i];
    entry = params[key];

    if (entry.multiValue) {
      for (j = 0; j < entry.multiValue.length; j++) {
        parts.push(key + '=' + entry.multiValue[j].value);
      }
    } else {
      parts.push(key + '=' + entry.value);
    }
  }

  return parts.join('&');
}
