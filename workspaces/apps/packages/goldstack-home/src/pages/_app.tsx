/* eslint-disable react/prop-types */
// ensure all pages have Bootstrap CSS
import '../styles/fonts.css';
import '../styles/app.css';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

import * as gtag from './../lib/ga';

import { ThemeProvider } from 'styled-components';

import { init } from '@fullstory/browser';

const theme = {};

const BootstrapApp = ({ Component, pageProps }): JSX.Element => {
  process.env.GOLDSTACK_DEPLOYMENT =
    process.env.NEXT_PUBLIC_GOLDSTACK_DEPLOYMENT;

  gtag.initGtm('UA-180192522-1');
  const router = useRouter();

  useEffect(() => {
    if (process.env.GOLDSTACK_DEPLOYMENT === 'prod') {
      init({ orgId: 'YN5JJ' });
    }
  }, []);

  // see https://medium.com/frontend-digest/using-nextjs-with-google-analytics-and-typescript-620ba2359dea
  useEffect(() => {
    let handleRouteChange: any = undefined;
    if (process.env.GOLDSTACK_DEPLOYMENT === 'prod') {
      handleRouteChange = (url): void => {
        gtag.pageview({
          path: router.pathname,
          url: url,
        });
      };
      router.events.on('routeChangeComplete', handleRouteChange);
    }
    return (): void => {
      if (handleRouteChange) {
        router.events.off('routeChangeComplete', handleRouteChange);
      }
    };
  }, [router.events]);

  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
};

export default BootstrapApp;
