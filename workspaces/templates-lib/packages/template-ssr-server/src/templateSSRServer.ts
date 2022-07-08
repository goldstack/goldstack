import React from 'react';

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

export interface RenderPageProps<PropType> {
  entryPoint: string;
  event: APIGatewayProxyEventV2;
  renderDocument: (props: RenderDocumentProps) => string;
  component: React.FunctionComponent<PropType>;
  properties: PropType;
}

export const renderPage = async <PropType>({
  entryPoint,
  event,
  renderDocument,
  component,
  properties,
}: RenderPageProps<PropType>): Promise<APIGatewayProxyResultV2> => {
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
          body: `window.initialProperties=${JSON.stringify(
            properties
          )};${readFileSync(clientBundleFileName, 'utf-8')}`,
        };
      } else {
        // if not running in Lambda build bundle dynamically
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require(excludeInBundle('./compileBundle')).bundleResponse({
          entryPoint,
          initialProperties: properties,
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

  const page = renderToString(React.createElement(component, properties));

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
