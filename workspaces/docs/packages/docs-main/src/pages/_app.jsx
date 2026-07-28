/* eslint-disable react/prop-types */
import { useEffect } from 'react';
import './../styles/fonts.css';
import './../styles/app.css';
import './../styles/docs.css';
import './../styles/goldstack-docs.css';
import { init } from '@fullstory/browser';
import { initGtm, pageview } from '@goldstack/utils-track';
import { useRouter } from 'next/router';
import { ThemeProvider } from 'styled-components';
const theme = {
    colors: {
        title: 'purple',
    },
};
const BootstrapApp = ({ Component, pageProps }) => {
    process.env.GOLDSTACK_DEPLOYMENT = process.env.NEXT_PUBLIC_GOLDSTACK_DEPLOYMENT;
    initGtm('UA-180192522-1');
    const router = useRouter();
    useEffect(() => {
        if (process.env.GOLDSTACK_DEPLOYMENT === 'prod') {
            init({ orgId: 'YN5JJ' });
        }
    }, []);
    // see https://medium.com/frontend-digest/using-nextjs-with-google-analytics-and-typescript-620ba2359dea
    useEffect(() => {
        let handleRouteChange;
        if (process.env.GOLDSTACK_DEPLOYMENT === 'prod') {
            handleRouteChange = (url) => {
                pageview({
                    // path: router.pathname,
                    path: url, // Use URL as path since automatically resolved document page names should include the resolved ids
                    url: url,
                });
            };
            router.events.on('routeChangeComplete', handleRouteChange);
        }
        return () => {
            if (handleRouteChange) {
                router.events.off('routeChangeComplete', handleRouteChange);
            }
        };
    }, [router.events]);
    // see https://github.com/styled-components/styled-components/issues/3731
    // biome-ignore lint/suspicious/noExplicitAny: styled-components type issue
    const ThemeProviderPatched = ThemeProvider;
    return (<ThemeProviderPatched theme={theme}>
      <Component {...pageProps}/>
    </ThemeProviderPatched>);
};
export default BootstrapApp;
//# sourceMappingURL=_app.jsx.map