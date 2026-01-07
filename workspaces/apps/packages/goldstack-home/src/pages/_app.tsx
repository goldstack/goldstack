/* eslint-disable react/prop-types */
// ensure all pages have Bootstrap CSS
import '../styles/fonts.css';
import '../styles/app.css';

import { init } from '@fullstory/browser';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { ThemeProvider } from 'styled-components';
import * as gtag from './../lib/ga';

const theme = {};

const BootstrapApp = ({ Component, pageProps }): React.ReactNode => {
  process.env.GOLDSTACK_DEPLOYMENT = process.env.NEXT_PUBLIC_GOLDSTACK_DEPLOYMENT;

  gtag.initGtm('UA-180192522-1');
  const router = useRouter();

  useEffect(() => {
    if (process.env.GOLDSTACK_DEPLOYMENT === 'prod') {
      init({ orgId: 'YN5JJ' });
    }
  }, []);

  // see https://medium.com/frontend-digest/using-nextjs-with-google-analytics-and-typescript-620ba2359dea
  useEffect(() => {
    // biome-ignore lint/suspicious/noExplicitAny: Function type varies based on environment
    let handleRouteChange: any;
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
  }, [router.events, router.pathname]);

  // see https://github.com/styled-components/styled-components/issues/3731
  // biome-ignore lint/suspicious/noExplicitAny: ThemeProvider type assertion required for Next.js compatibility
  const ThemeProviderPatched = ThemeProvider as any;
  return (
    <ThemeProviderPatched theme={theme}>
      <Component {...pageProps} />
    </ThemeProviderPatched>
  );
};

export default BootstrapApp;
