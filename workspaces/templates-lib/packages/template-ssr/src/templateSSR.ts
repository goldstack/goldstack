export * from './types/SSRPackage';

import type { APIGatewayProxyResultV2 } from 'aws-lambda';

import ReactDOM from 'react-dom/client';
import type { RenderPageProps } from '@goldstack/template-ssr-server';

export const renderPage = async (
  props: RenderPageProps
): Promise<APIGatewayProxyResultV2> => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('@goldstack/template-ssr-server').renderPage(props);
};

function isServer(): boolean {
  return !(typeof window != 'undefined' && window.document);
}

export const hydrate = (
  element: React.ReactElement<any, string | React.JSXElementConstructor<any>>
): void => {
  if (isServer()) return;

  const node = document.getElementById('root');
  if (!node) {
    throw new Error('No DOM node found with id "root" found');
  }
  ReactDOM.hydrateRoot(node, element);
};
