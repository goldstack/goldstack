/* eslint-disable react/prop-types */
import React from 'react';
import type { AppProps } from 'next/app';

import './../src/styles/app.css';

const BootstrapApp = ({ Component, pageProps }: AppProps): React.ReactNode => {
  process.env.GOLDSTACK_DEPLOYMENT = process.env.NEXT_PUBLIC_GOLDSTACK_DEPLOYMENT;
  return <Component {...pageProps} />;
};

export default BootstrapApp;
