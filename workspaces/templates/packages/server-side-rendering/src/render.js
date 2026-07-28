import {
  getDeployment,
  hydrate as ssrHydrate,
  renderPage as ssrRenderPage,
} from '@goldstack/template-ssr';
import goldstackJson from './../goldstack.json';
import Wrapped from './_app';
import renderDocument from './_document';
import buildConfig from './build';
import staticFileMapperStore from './state/staticFiles.json';
export async function renderPage(props) {
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
export function hydrate(c) {
  ssrHydrate(Wrapped({ Component: c }));
}
//# sourceMappingURL=render.js.map
