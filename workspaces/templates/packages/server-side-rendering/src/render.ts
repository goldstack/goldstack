import { PartialRenderPageProps } from '@goldstack/template-ssr';

import {
  renderPage as ssrRenderPage,
  hydrate as ssrHydrate,
} from '@goldstack/template-ssr';
import { APIGatewayProxyResultV2 } from 'aws-lambda';

import Wrapped from './_app';

import staticFileMapperStore from './state/staticFiles.json';

import renderDocument from './_document';

import buildConfig from './build';

export async function renderPage<P>(
  props: PartialRenderPageProps<P>
): Promise<APIGatewayProxyResultV2> {
  return ssrRenderPage({
    staticFileMapperStore,
    renderDocument,
    buildConfig: () => {
      return buildConfig();
    },
    ...props,
    component: Wrapped({
      Component: props.component,
    }),
  });
}

export function hydrate(c: React.FunctionComponent<any>): void {
  ssrHydrate(Wrapped({ Component: c }));
}
