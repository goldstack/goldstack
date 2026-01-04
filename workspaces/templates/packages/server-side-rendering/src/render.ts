import {
  getDeployment,
  type PartialRenderPageProps,
  type ReactPropertiesType,
  hydrate as ssrHydrate,
  renderPage as ssrRenderPage,
} from '@goldstack/template-ssr';
import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import goldstackJson from './../goldstack.json';
import Wrapped from './_app';
import renderDocument from './_document';
import buildConfig from './build';
import staticFileMapperStore from './state/staticFiles.json';

export async function renderPage<P extends ReactPropertiesType>(
  props: PartialRenderPageProps<P>,
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

export function hydrate(
  c: React.FunctionComponent<ReactPropertiesType>,
): void {
  ssrHydrate(Wrapped({ Component: c }));
}
