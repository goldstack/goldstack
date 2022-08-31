import React from 'react';

import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

import { compress } from 'lambda-compression';

import { renderToString } from 'react-dom/server';
import { excludeInBundle } from '@goldstack/utils-esbuild';
import { readFileSync } from 'fs';

import { MappingStore, StaticFileMapperRun } from 'static-file-mapper';

import type {
  BuildConfiguration,
  ServerBuildOptionsArgs,
  ClientBuildOptionsArgs,
} from '@goldstack/template-ssr-server-compile-bundle';

export type {
  BuildConfiguration,
  ServerBuildOptionsArgs,
  ClientBuildOptionsArgs,
};

import { StaticFileMapper } from 'static-file-mapper';

export const clientBundleFileName = 'client.bundle.js';
export const clientCSSFileName = 'client.bundle.css';

export interface RenderDocumentProps<PropType> {
  injectIntoHead: string;
  injectIntoBody: string;
  staticFileMapper: StaticFileMapper;
  event: APIGatewayProxyEventV2;
  properties: PropType;
}

export interface RenderPageProps<PropType> {
  entryPoint: string;
  event: APIGatewayProxyEventV2;
  renderDocument: (props: RenderDocumentProps<PropType>) => string;
  component: React.FunctionComponent<PropType>;
  staticFileMapper?: StaticFileMapper;
  staticFileMapperStore?: unknown;
  properties: PropType;
  buildConfig: () => BuildConfiguration;
}

export const renderPage = async <PropType>({
  entryPoint,
  event,
  renderDocument,
  staticFileMapper,
  staticFileMapperStore,
  component,
  properties,
  buildConfig,
}: RenderPageProps<PropType>): Promise<APIGatewayProxyResultV2> => {
  if (!staticFileMapper && !staticFileMapperStore) {
    throw new Error(
      '`staticFileMapper` or `staticFileMapper` store need to be defined for `renderPage`'
    );
  }
  if (!staticFileMapper) {
    staticFileMapperStore = new StaticFileMapperRun({
      store: staticFileMapperStore as MappingStore,
      baseUrl: '_goldstack/static/generated/',
    });
  }
  if (event.queryStringParameters && event.queryStringParameters['resource']) {
    if (event.queryStringParameters['resource'].indexOf('js') > -1) {
      if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
        // if running in Lambda load bundle from local file system
        return compress(event, {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/javascript',
            SourceMap: await staticFileMapper.resolve({
              name: `${process.env.AWS_LAMBDA_FUNCTION_NAME}.map`,
            }),
          },
          body: `${readFileSync(clientBundleFileName, 'utf-8')}`,
        });
      } else {
        // if not running in Lambda build bundle dynamically
        return compress(
          event,
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          require(excludeInBundle(
            '@goldstack/template-ssr-server-compile-bundle'
          )).bundleResponse({
            entryPoint,
            buildConfig: buildConfig(),
          })
        );
      }
    }

    if (event.queryStringParameters['resource'].indexOf('sourcemap') > -1) {
      if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
        throw new Error(
          'sourcemap resource not supported. Please load sourcemap from static files.'
        );
        // if running in Lambda load sourcemap from local file system
        // return compress(event, {
        //   statusCode: 200,
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: readFileSync(clientBundleFileName + '.map', 'utf-8'),
        // });
      } else {
        return compress(
          event,
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          require(excludeInBundle(
            '@goldstack/template-ssr-server-compile-bundle'
          )).sourceMapResponse({
            entryPoint,
            buildConfig: buildConfig(),
          })
        );
      }
    }
  }

  const page = renderToString(React.createElement(component, properties));

  let styles: string | undefined;
  // only inject styles when in lambda - otherwise they are loaded dynamically
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    styles = readFileSync(clientCSSFileName, 'utf-8');
  } else {
    styles = undefined;
  }

  const document = renderDocument({
    injectIntoHead: `${styles ? `<style>${styles}</style>` : ''}`,
    injectIntoBody: `
        <div id="root">${page}</div>
        <script>window.initialProperties=${JSON.stringify(properties)};</script>
        <script src="?resource=js"></script>
    `,
    staticFileMapper: staticFileMapper,
    event,
    properties,
  });

  return compress(event, {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: document,
  });
};
