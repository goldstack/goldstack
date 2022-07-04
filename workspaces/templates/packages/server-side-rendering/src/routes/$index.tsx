import React from 'react';

import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

import { renderDocument } from './../_document';
import { renderPage, hydrate } from '@goldstack/template-ssr';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

const Index = (): JSX.Element => {
  return (
    <>
      <div
        onClick={() => {
          alert('hi');
          throw new Error('Havent seen this');
        }}
      >
        Hello, world!
      </div>
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: ProxyHandler = async (event, context) => {
  return renderPage({
    element: <Index />,
    entryPoint: __filename,
    event: event,
    renderDocument,
  });
};

hydrate(<Index />);

export default Index;
