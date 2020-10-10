/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ServerStyleSheet } from 'styled-components';
import { TagFragment, initGtm } from '@goldstack/utils-track';

import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document';

class MyHtml extends Html implements JSX.Element {
  type: any;
  props: any;
  key: string | number | null;
  setState: any;
  forceUpdate: any;
  state: any;
  refs: any;
  constructor() {
    super();
    this.key = null;
  }
}

class MyHead extends Head implements JSX.Element {
  type: any;
  props: any;
  key: string | number | null;
  setState: any;
  forceUpdate: any;
  state: any;
  refs: any;
  constructor() {
    super();
    this.key = null;
  }
}

class MyMain extends Main implements JSX.Element {
  type: any;
  props: any;
  key: string | number | null;
  setState: any;
  forceUpdate: any;
  state: any;
  refs: any;
  constructor() {
    super();
    this.key = null;
  }
}

class MyNextScript extends NextScript implements JSX.Element {
  type: any;
  props: any;
  key: string | number | null;
  setState: any;
  forceUpdate: any;
  state: any;
  refs: any;
  constructor() {
    super();
    this.key = null;
  }
}

class MyDocument extends Document {
  static async getStaticProps(ctx: DocumentContext): Promise<any> {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = (): any =>
        originalRenderPage({
          enhanceApp: (App: any) => (props: any): JSX.Element =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }
  render(): JSX.Element {
    process.env.GOLDSTACK_DEPLOYMENT =
      process.env.NEXT_PUBLIC_GOLDSTACK_DEPLOYMENT;

    initGtm('UA-180192522-1');
    return (
      <MyHtml>
        <MyHead>
          {process.env.GOLDSTACK_DEPLOYMENT === 'prod' && <TagFragment />}
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/site.webmanifest"></link>
        </MyHead>
        <body>
          <MyMain />
          <MyNextScript />
        </body>
      </MyHtml>
    );
  }
}

export default MyDocument;
