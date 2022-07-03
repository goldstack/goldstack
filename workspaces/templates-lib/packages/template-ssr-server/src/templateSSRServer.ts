import type React from 'react';

import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

import { renderToString } from 'react-dom/server';
import { excludeInBundle } from '@goldstack/utils-esbuild';
import { readFileSync } from 'fs';

export const clientBundleFileName = 'client.bundle.js';

export interface RenderDocumentProps {
  bundledJsPath: string;
  renderedHtml: string;
}

export interface RenderPageProps {
  entryPoint: string;
  event: APIGatewayProxyEventV2;
  renderDocument: (props: RenderDocumentProps) => string;
  element: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
}

export const renderPage = async ({
  entryPoint,
  event,
  renderDocument,
  element,
}: RenderPageProps): Promise<APIGatewayProxyResultV2> => {
  if (event.queryStringParameters && event.queryStringParameters['resource']) {
    if (event.queryStringParameters['resource'].indexOf('js') > -1) {
      if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
        // if running in Lambda load bundle from local file system
        return {
          statusCode: 201,
          headers: {
            'Content-Type': 'application/javascript',
            SourceMap: '?resource=sourcemap',
          },
          body: readFileSync(clientBundleFileName, 'utf-8'),
        };
      } else {
        // if not running in Lambda build bundle dynamically
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require(excludeInBundle('./compileBundle')).bundleResponse({
          entryPoint,
        });
      }
    }

    if (event.queryStringParameters['resource'].indexOf('sourcemap') > -1) {
      if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
        // if running in Lambda load sourcemap from local file system
        return {
          statusCode: 201,
          headers: {
            'Content-Type': 'application/json',
          },
          body: readFileSync(clientBundleFileName + '.map', 'utf-8'),
        };
      } else {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require(excludeInBundle('./compileBundle')).sourceMapResponse({
          entryPoint,
        });
      }
    }
  }

  const page = renderToString(element);

  const document = renderDocument({
    bundledJsPath: '?resource=js',
    renderedHtml: page,
  });
  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'text/html',
    },
    body: document,
  };
};
