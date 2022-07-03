export * from './types/SSRPackage';

import type { APIGatewayProxyResultV2 } from 'aws-lambda';

import type { RenderPageProps } from '@goldstack/template-ssr-server';

export const renderPage = async (
  props: RenderPageProps
): Promise<APIGatewayProxyResultV2> => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('@goldstack/template-ssr-server').renderPage(props);
};
