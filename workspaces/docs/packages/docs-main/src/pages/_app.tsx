/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';

import './../styles/fonts.css';
import './../styles/app.css';
import './../styles/docs.css';
import './../styles/goldstack-docs.css';

import { ThemeProvider } from 'styled-components';

import { useRouter } from 'next/router';
import { initGtm, pageview } from '@goldstack/utils-track';

import { init } from '@fullstory/browser';

const theme = {
  colors: {
    title: 'purple',
  },
};

const BootstrapApp = ({ Component, pageProps }): JSX.Element => {
  process.env.GOLDSTACK_DEPLOYMENT =
    process.env.NEXT_PUBLIC_GOLDSTACK_DEPLOYMENT;
  initGtm('UA-180192522-1');
  const router = useRouter();

  useEffect(() => {
    if (process.env.GOLDSTACK_DEPLOYMENT === 'prod') {
      init({ orgId: 'YN5JJ' });
    }
  }, []);

  // see https://medium.com/frontend-digest/using-nextjs-with-google-analytics-and-typescript-620ba2359dea
  useEffect(() => {
    let handleRouteChange: any ;
    if (process.env.GOLDSTACK_DEPLOYMENT === 'prod') {
      handleRouteChange = (url): void => {
        pageview({
          // path: router.pathname,
          path: url, // Use URL as path since automatically resolved document page names should include the resolved ids
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
  // see https://github.com/styled-components/styled-components/issues/3731
  const ThemeProviderPatched = ThemeProvider as any;
  return (
    <ThemeProviderPatched theme={theme}>
      <Component {...pageProps} />
    </ThemeProviderPatched>
  );
};

export default BootstrapApp;
