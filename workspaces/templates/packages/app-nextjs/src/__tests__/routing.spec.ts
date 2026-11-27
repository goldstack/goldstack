import { readFileSync } from 'fs';
import path from 'path';
import ts from 'typescript';
import vm from 'vm';

interface CloudFrontFunctionRequest {
  uri: string;
  querystring: Record<string, { value: string } | { multiValue: { value: string }[] }>;
  headers: {
    host: {
      value: string;
    };
  };
}

interface RedirectResponse {
  statusCode: number;
  statusDescription: string;
  headers: {
    location: {
      value: string;
    };
  };
}

type RoutingHandler = (event: {
  request: CloudFrontFunctionRequest;
}) => CloudFrontFunctionRequest | RedirectResponse;

function loadHandler(): RoutingHandler {
  const source = readFileSync(path.join(__dirname, '../utils/routing/lambda.ts'), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.CommonJS,
    },
  }).outputText;
  const context: { handler?: RoutingHandler } = {};
  vm.runInNewContext(compiled, context);
  if (!context.handler) {
    throw new Error('Routing handler did not define a global handler function');
  }
  return context.handler;
}

function route(
  uri: string,
  querystring: CloudFrontFunctionRequest['querystring'] = {},
): CloudFrontFunctionRequest | RedirectResponse {
  const handler = loadHandler();
  return handler({
    request: {
      uri,
      querystring,
      headers: {
        host: {
          value: 'example.com',
        },
      },
    },
  });
}

describe('CloudFront static export routing', () => {
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
    expect(route(uri)).toMatchObject({ uri: expectedUri });
  });

  test('does not redirect the root path', () => {
    expect(route('/', { q: { value: 'x' } })).toMatchObject({
      uri: '/index.html',
      querystring: { q: { value: 'x' } },
    });
  });

  test('redirects a trailing slash with a 308 and preserves a single query value', () => {
    expect(route('/docs/', { q: { value: 'a%20b' } })).toMatchObject({
      statusCode: 308,
      statusDescription: 'Permanent Redirect',
      headers: {
        location: {
          value: 'https://example.com/docs?q=a%20b',
        },
      },
    });
  });

  test('redirects a trailing slash without a query string', () => {
    expect(route('/docs/')).toMatchObject({
      statusCode: 308,
      headers: {
        location: {
          value: 'https://example.com/docs',
        },
      },
    });
  });

  test('preserves multi-value and empty query parameters', () => {
    expect(
      route('/multi/', {
        tag: { multiValue: [{ value: 'a' }, { value: 'b' }] },
        empty: { value: '' },
      }),
    ).toMatchObject({
      statusCode: 308,
      headers: {
        location: {
          value: 'https://example.com/multi?tag=a&tag=b&empty=',
        },
      },
    });
  });

  test('redirects trailing slashes for files before checking for extensions', () => {
    expect(route('/docs/page.html/')).toMatchObject({
      statusCode: 308,
      headers: {
        location: {
          value: 'https://example.com/docs/page.html',
        },
      },
    });
  });
});
