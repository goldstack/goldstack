import type { CloudFrontRequestEvent, CloudFrontResultResponse } from 'aws-lambda';
import { handler } from '../utils/routing/lambda';

interface RequestInput {
  uri: string;
  querystring?: string;
  host?: string;
}

type RoutingResult = { uri: string; querystring?: string } | CloudFrontResultResponse;

function route({ uri, querystring = '', host = 'example.com' }: RequestInput): RoutingResult {
  const request = {
    uri,
    querystring,
    headers: {
      host: [{ key: 'Host', value: host }],
    },
  };

  let result: RoutingResult | undefined;
  handler(
    { Records: [{ cf: { request } }] } as unknown as CloudFrontRequestEvent,
    {} as never,
    (_error, response) => {
      result = response as RoutingResult;
    },
  );

  if (!result) {
    throw new Error('Handler did not return a result');
  }
  return result;
}

describe('Lambda@Edge static export routing', () => {
  test.each([
    ['/', '/index.html'],
    ['', '/index.html'],
    ['/docs', '/docs.html'],
    ['/docs/goldstack/about', '/docs/goldstack/about.html'],
    ['/v1.2/about', '/v1.2/about.html'],
    ['/assets/app.js', '/assets/app.js'],
    ['/_next/static/chunks/main.js', '/_next/static/chunks/main.js'],
    ['/favicon.ico', '/favicon.ico'],
    ['/foo//', '/foo//'],
  ])('rewrites %s to %s', (uri, expectedUri) => {
    expect(route({ uri })).toMatchObject({ uri: expectedUri });
  });

  test('does not redirect the root path and keeps the query string', () => {
    expect(route({ uri: '/', querystring: 'q=x' })).toMatchObject({
      uri: '/index.html',
      querystring: 'q=x',
    });
  });

  test('redirects a trailing slash with a 308 and preserves the query string', () => {
    expect(route({ uri: '/docs/', querystring: 'q=a%20b' })).toMatchObject({
      status: '308',
      statusDescription: 'Permanent Redirect',
      headers: {
        location: [
          {
            key: 'Location',
            value: '/docs?q=a%20b',
          },
        ],
      },
    });
  });

  test('redirects a trailing slash without a query string', () => {
    expect(route({ uri: '/docs/' })).toMatchObject({
      status: '308',
      headers: {
        location: [
          {
            key: 'Location',
            value: '/docs',
          },
        ],
      },
    });
  });

  test('preserves multi-value and empty query parameters', () => {
    expect(route({ uri: '/multi/', querystring: 'tag=a&tag=b&empty=' })).toMatchObject({
      status: '308',
      headers: {
        location: [
          {
            key: 'Location',
            value: '/multi?tag=a&tag=b&empty=',
          },
        ],
      },
    });
  });

  test('redirects trailing slashes for files before checking for extensions', () => {
    expect(route({ uri: '/docs/page.html/' })).toMatchObject({
      status: '308',
      headers: {
        location: [
          {
            key: 'Location',
            value: '/docs/page.html',
          },
        ],
      },
    });
  });
});
