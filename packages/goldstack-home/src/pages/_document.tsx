/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ServerStyleSheet } from 'styled-components';
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
  // render(): JSX.Element {
  //   return (
  //     <MyHtml>
  //       <MyHead>
  //         <link
  //           href="https://fonts.googleapis.com/css?family=Open+Sans:400,600&display=swap"
  //           rel="stylesheet"
  //         />
  //         <link
  //           href="https://fonts.googleapis.com/css2?family=Ultra&display=swap"
  //           rel="stylesheet"
  //         ></link>
  //       </MyHead>
  //       <body>
  //         <MyMain />
  //         <MyNextScript />
  //       </body>
  //     </MyHtml>
  //   );
  // }
}

export default MyDocument;
