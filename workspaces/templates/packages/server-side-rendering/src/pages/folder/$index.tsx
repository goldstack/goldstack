import React from 'react';

import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

import { renderToString } from 'react-dom/server';

import Index from '../../components/indexPage';
import { renderDocument } from './../../_document';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: ProxyHandler = async (event, context) => {
  const app = renderToString(<Index />);

  const document = renderDocument({
    bundledJsPath: 'bundle.js',
    renderedHtml: app,
  });
  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'text/html',
    },
    body: document,
  };
};
