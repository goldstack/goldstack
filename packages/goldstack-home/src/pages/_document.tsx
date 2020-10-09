/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Fragment } from 'react';
import { ServerStyleSheet } from 'styled-components';
import { GA_TRACKING_ID } from '../lib/ga';

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
    return (
      <MyHtml>
        <MyHead>
          {process.env.GOLDSTACK_DEPLOYMENT === 'prod' && (
            <Fragment>
              {/* Global Site Tag (gtag.js) - Google Analytics */}
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', '${GA_TRACKING_ID}', {
  page_path: window.location.pathname,
});`,
                }}
              />
            </Fragment>
          )}
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
