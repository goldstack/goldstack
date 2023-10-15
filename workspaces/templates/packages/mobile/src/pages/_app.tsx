import Head from 'next/head';
import React from 'react';

// eslint-disable-next-line react/prop-types
export default function App({ Component, pageProps }): JSX.Element {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
