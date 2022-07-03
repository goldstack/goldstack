export * from './types/SSRPackage';

import type React from 'react';

import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { renderToString } from 'react-dom/server';
import { excludeInBundle } from '@goldstack/utils-esbuild';

export interface RenderDocumentProps {
  bundledJsPath: string;
  renderedHtml: string;
}

export const renderPage = async ({
  entryPoint,
  event,
  renderDocument,
  element,
}: {
  entryPoint: string;
  event: APIGatewayProxyEventV2;
  renderDocument: (props: RenderDocumentProps) => string;
  element: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
}): Promise<APIGatewayProxyResultV2> => {
  if (
    event.queryStringParameters &&
    event.queryStringParameters['resource'] &&
    event.queryStringParameters['resource'].indexOf('js') > -1
  ) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(excludeInBundle('./compileBundle')).compileBundle(
      entryPoint
    );
  }

  if (
    event.queryStringParameters &&
    event.queryStringParameters['resource'] &&
    event.queryStringParameters['resource'].indexOf('sourcemap') > -1
  ) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(excludeInBundle('./compileBundle')).compileSourceMap({
      entryPoint,
    });
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
