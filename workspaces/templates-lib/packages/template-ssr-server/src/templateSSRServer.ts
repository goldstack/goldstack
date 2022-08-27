import React from 'react';

import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

import { compress } from 'lambda-compression';

import { renderToString } from 'react-dom/server';
import { excludeInBundle } from '@goldstack/utils-esbuild';
import { readFileSync } from 'fs';

import type {
  BuildConfiguration,
  ServerBuildOptionsArgs,
  ClientBuildOptionsArgs,
} from '@goldstack/template-ssr-server-compile-bundle';

export type {
  BuildConfiguration,
  ServerBuildOptionsArgs,
  ClientBuildOptionsArgs,
};

export const clientBundleFileName = 'client.bundle.js';
export const clientCSSFileName = 'client.bundle.css';

export interface RenderDocumentProps {
  bundledJsPath: string;
  styles?: string;
  renderedHtml: string;
}

export interface RenderPageProps<PropType> {
  entryPoint: string;
  event: APIGatewayProxyEventV2;
  renderDocument: (props: RenderDocumentProps) => string;
  component: React.FunctionComponent<PropType>;
  properties: PropType;
  buildConfig: () => BuildConfiguration;
}

export const renderPage = async <PropType>({
  entryPoint,
  event,
  renderDocument,
  component,
  properties,
  buildConfig,
}: RenderPageProps<PropType>): Promise<APIGatewayProxyResultV2> => {
  if (event.queryStringParameters && event.queryStringParameters['resource']) {
    if (event.queryStringParameters['resource'].indexOf('js') > -1) {
      if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
        // if running in Lambda load bundle from local file system
        return compress(event, {
          statusCode: 201,
          headers: {
            'Content-Type': 'application/javascript',
            SourceMap: '?resource=sourcemap',
          },
          body: `window.initialProperties=${JSON.stringify(
            properties
          )};${readFileSync(clientBundleFileName, 'utf-8')}`,
        });
      } else {
        // if not running in Lambda build bundle dynamically
        return compress(
          event,
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          require(excludeInBundle(
            '@goldstack/template-ssr-server-compile-bundle'
          )).bundleResponse({
            entryPoint,
            initialProperties: properties,
            buildConfig: buildConfig(),
          })
        );
      }
    }

    if (event.queryStringParameters['resource'].indexOf('sourcemap') > -1) {
      if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
        // if running in Lambda load sourcemap from local file system
        return compress(event, {
          statusCode: 201,
          headers: {
            'Content-Type': 'application/json',
          },
          body: readFileSync(clientBundleFileName + '.map', 'utf-8'),
        });
      } else {
        return compress(
          event,
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          require(excludeInBundle(
            '@goldstack/template-ssr-server-compile-bundle'
          )).sourceMapResponse({
            entryPoint,
            buildConfig: buildConfig(),
          })
        );
      }
    }
  }

  const page = renderToString(React.createElement(component, properties));

  let styles: string | undefined;
  // only inject styles when in lambda - otherwise they are loaded dynamically
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    styles = readFileSync(clientCSSFileName, 'utf-8');
  } else {
    styles = undefined;
  }

  const document = renderDocument({
    bundledJsPath: '?resource=js',
    styles,
    renderedHtml: page,
  });
  return compress(event, {
    statusCode: 201,
    headers: {
      'Content-Type': 'text/html',
    },
    body: document,
  });
};
