/* eslint-disable react/prop-types */
import React from 'react';

import './../styles/app.css';

const BootstrapApp = ({ Component, pageProps }): JSX.Element => {
  process.env.GOLDSTACK_DEPLOYMENT =
    process.env.NEXT_PUBLIC_GOLDSTACK_DEPLOYMENT;
  return <Component {...pageProps} />;
};

export default BootstrapApp;
