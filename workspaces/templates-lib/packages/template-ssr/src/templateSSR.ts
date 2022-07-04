import React from 'react';
export * from './types/SSRPackage';

import type { APIGatewayProxyResultV2 } from 'aws-lambda';

import ReactDOM from 'react-dom/client';
import type { RenderPageProps } from '@goldstack/template-ssr-server';

export type { RenderDocumentProps } from '@goldstack/template-ssr-server';

export const renderPage = async <PropType>(
  props: RenderPageProps<PropType>
): Promise<APIGatewayProxyResultV2> => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('@goldstack/template-ssr-server').renderPage(props);
};

function isServer(): boolean {
  return !(typeof window != 'undefined' && window.document);
}

export const hydrate = (
  // element: React.ReactElement<any, string | React.JSXElementConstructor<any>>
  c: React.FunctionComponent<any>
): void => {
  if (isServer()) return;

  const node = document.getElementById('root');
  if (!node) {
    throw new Error('No DOM node found with id "root"');
  }
  ReactDOM.hydrateRoot(
    node,
    React.createElement(c, (window as any).initialProperties)
  );
};
