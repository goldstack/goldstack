import {
  getDeployment,
  PartialRenderPageProps,
  ReactPropertiesType,
} from '@goldstack/template-ssr';

import {
  renderPage as ssrRenderPage,
  hydrate as ssrHydrate,
} from '@goldstack/template-ssr';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

import Wrapped from './_app';

import staticFileMapperStore from './state/staticFiles.json';

import goldstackJson from './../goldstack.json';

import renderDocument from './_document';

import buildConfig from './build';

export async function renderPage<P extends ReactPropertiesType>(
  props: PartialRenderPageProps<P>
): Promise<APIGatewayProxyStructuredResultV2> {
  const deployment = getDeployment(goldstackJson);
  return ssrRenderPage({
    staticFileMapperStore,
    renderDocument,
    deployment,
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
