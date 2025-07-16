/* eslint-disable react/prop-types */
import type { AppProps } from 'next/app';
import React from 'react';

import './../src/styles/app.css';

const BootstrapApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  process.env.GOLDSTACK_DEPLOYMENT =
    process.env.NEXT_PUBLIC_GOLDSTACK_DEPLOYMENT;
  return <Component {...pageProps} />;
};

export default BootstrapApp;
