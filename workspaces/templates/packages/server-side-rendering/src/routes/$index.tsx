import React from 'react';

import ReactDOM from 'react-dom';

import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

import { renderPage } from '@goldstack/template-ssr';

import { renderDocument } from './../_document';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

const Index = (): JSX.Element => {
  return (
    <>
      <div
        onClick={() => {
          alert('hi');
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

function isServer(): boolean {
  return !(typeof window != 'undefined' && window.document);
}

const hydrate = (): void => {
  const node = document.getElementById('root');

  console.log(node);
  console.log('hydrating');
  ReactDOM.hydrate(<Index />, node);
};

if (!isServer()) {
  hydrate();
}

export default Index;
