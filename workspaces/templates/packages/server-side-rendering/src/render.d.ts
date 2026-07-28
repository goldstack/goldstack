import { type PartialRenderPageProps, type ReactPropertiesType } from '@goldstack/template-ssr';
import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
export declare function renderPage<P extends ReactPropertiesType>(
  props: PartialRenderPageProps<P>,
): Promise<APIGatewayProxyStructuredResultV2>;
export declare function hydrate(c: React.FunctionComponent<any>): void;
//# sourceMappingURL=render.d.ts.map
