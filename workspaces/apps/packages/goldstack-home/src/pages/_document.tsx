/* eslint-disable @typescript-eslint/no-explicit-any */

import { initGtm, TagFragment } from '@goldstack/utils-track';
import Document, { type DocumentContext, Head, Html, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

class MyDocument extends Document {
  // biome-ignore lint/suspicious/noExplicitAny: Next.js Document.getStaticProps returns complex type
  static async getStaticProps(ctx: DocumentContext): Promise<any> {
    // biome-ignore lint/suspicious/noExplicitAny: ServerStyleSheet type assertion required for styled-components
    const sheet = new ServerStyleSheet() as any;
    const originalRenderPage = ctx.renderPage;

    try {
      // biome-ignore lint/suspicious/noExplicitAny: renderPage returns complex type
      ctx.renderPage = (): any =>
        originalRenderPage({
          enhanceApp:
            // biome-ignore lint/suspicious/noExplicitAny: App component type varies
              (App: any) =>
              // biome-ignore lint/suspicious/noExplicitAny: props type varies
              (props: any): React.ReactNode =>
                // biome-ignore lint/suspicious/noExplicitAny: styled-components collectStyles returns any
                sheet.collectStyles(<App {...props} />) as any,
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
  render(): React.ReactElement {
    process.env.GOLDSTACK_DEPLOYMENT = process.env.NEXT_PUBLIC_GOLDSTACK_DEPLOYMENT;

    initGtm('UA-180192522-1');
    return (
      <Html>
        <Head>
          {process.env.GOLDSTACK_DEPLOYMENT === 'prod' && <TagFragment />}
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/site.webmanifest"></link>
          {process.env.GOLDSTACK_DEPLOYMENT === 'dev' && (
            <meta name="robots" content="noindex"></meta>
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
