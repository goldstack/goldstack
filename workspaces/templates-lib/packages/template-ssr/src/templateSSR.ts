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
  console.log(event.pathParameters);
  console.log(event.queryStringParameters);
  if (
    event.queryStringParameters &&
    event.queryStringParameters['js'] &&
    event.queryStringParameters['js'].indexOf('true') > -1
  ) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(excludeInBundle('./compileBundle')).compileBundle(
      entryPoint
    );
  }

  const page = renderToString(element);

  const document = renderDocument({
    bundledJsPath: '?js=true',
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
