import React, { type FunctionComponent } from 'react';

import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';

import { compress } from 'lambda-compression';

import { renderToString } from 'react-dom/server';
import { excludeInBundle } from '@goldstack/utils-esbuild';
import { readFileSync } from 'fs';

import { type MappingStore, StaticFileMapperRun } from 'static-file-mapper';

export type ReactPropertiesType = unknown &
  JSX.IntrinsicAttributes &
  Record<string, any>;

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

import type { StaticFileMapper } from 'static-file-mapper';
import type { Deployment } from '@goldstack/infra';

export const clientBundleFileName = 'client.bundle.js';
export const clientCSSFileName = 'client.bundle.css';

export interface RenderDocumentProps<PropType extends ReactPropertiesType> {
  injectIntoHead: string;
  injectIntoBody: string;
  deployment: Deployment;
  staticFileMapper: StaticFileMapper;
  event: APIGatewayProxyEventV2;
  properties: PropType;
}

export interface PartialRenderPageProps<PropType extends ReactPropertiesType> {
  entryPoint: string;
  event: APIGatewayProxyEventV2;
  renderDocument?: (props: RenderDocumentProps<PropType>) => Promise<string>;
  appendToHead?: string;
  appendToBody?: string;
  component: React.FunctionComponent<PropType>;
  staticFileMapper?: StaticFileMapper;
  staticFileMapperStore?: unknown;
  properties: PropType;
  buildConfig?: () => BuildConfiguration;
}

export interface RenderPageProps<PropType extends ReactPropertiesType> {
  entryPoint: string;
  event: APIGatewayProxyEventV2;
  appendToHead?: string;
  appendToBody?: string;
  deployment: Deployment;
  renderDocument: (props: RenderDocumentProps<PropType>) => Promise<string>;
  component: React.FunctionComponent<PropType>;
  staticFileMapper?: StaticFileMapper;
  staticFileMapperStore?: unknown;
  properties: PropType;
  buildConfig: () => BuildConfiguration;
}

export const renderPage = async <PropType extends ReactPropertiesType>({
  entryPoint,
  event,
  renderDocument,
  appendToBody,
  appendToHead,
  staticFileMapper,
  staticFileMapperStore,
  component,
  deployment,
  properties,
  buildConfig,
}: RenderPageProps<PropType>): Promise<APIGatewayProxyStructuredResultV2> => {
  if (!staticFileMapper && !staticFileMapperStore) {
    throw new Error(
      '`staticFileMapper` or `staticFileMapper` store need to be defined for `renderPage`'
    );
  }
  if (!staticFileMapper) {
    staticFileMapper = new StaticFileMapperRun({
      store: staticFileMapperStore as MappingStore,
      baseUrl: '/_goldstack/static/generated/',
    });
  }
  if (event.queryStringParameters && event.queryStringParameters['resource']) {
    if (event.queryStringParameters['resource'].indexOf('js') > -1) {
      if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
        // if running in Lambda load bundle from local file system
        let SourceMap = '';
        if (
          await staticFileMapper.has({
            name: `${process.env.AWS_LAMBDA_FUNCTION_NAME}.map`,
          })
        ) {
          SourceMap = await staticFileMapper.resolve({
            name: `${process.env.AWS_LAMBDA_FUNCTION_NAME}.map`,
          });
        }
        return compress(event, {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/javascript',
            SourceMap,
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
          'sourcemap resource not supported in Lambda. Please load sourcemap from static files.'
        );
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

  const page = renderToString(
    React.createElement(
      component as FunctionComponent<unknown>,
      properties as Record<string, unknown>
    )
  );

  let styles: string | undefined;
  // only inject styles when in lambda - otherwise they are loaded dynamically
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    styles = readFileSync(clientCSSFileName, 'utf-8');
  } else {
    styles = undefined;
  }

  const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME;

  let clientBundlePath: string;
  if (!functionName) {
    clientBundlePath = '?resource=js';
  } else {
    clientBundlePath = await staticFileMapper.resolve({
      name: `${functionName}-bundle.js`,
    });
  }

  const document = await renderDocument({
    injectIntoHead: `${styles ? `<style>${styles}</style>` : ''}
    ${appendToHead ? appendToHead : ''}`,
    deployment,
    injectIntoBody: `
        <div id="root">${page}</div>
        <script>window.initialProperties=${JSON.stringify(
          properties
        )};window.GOLDSTACK_DEPLOYMENT="${deployment.name}"</script>
        <script src="${clientBundlePath}"></script>
        ${appendToBody ? appendToBody : ''}
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
