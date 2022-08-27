import React from 'react';
import type { BundleArgs, BundledResource, Bundler } from 'lessr';
import { renderToString } from 'react-dom/server';

export interface HTMLRenderProps {
  headInject: string;
  bodyInject: string;
}

export interface ReactRenderArgs extends BundleArgs {
  component: React.FunctionComponent;
  html: (props: HTMLRenderProps) => Promise<string>;
}

export type ReactBundler<ReactBundleArgs extends BundleArgs> = Bundler<
  ReactBundleArgs,
  ReactRenderArgs
>;

export async function renderReact(
  args: ReactRenderArgs
): Promise<BundledResource> {
  const body = renderToString(React.createElement(args.component, args.props));
  const content = await args.html({
    bodyInject: body + '\n<script src="?resource=client.js"></script>',
    headInject: '',
  });
  return {
    name: '',
    content,
    mimeType: 'text/html',
    path: 'index.html',
  };
}
