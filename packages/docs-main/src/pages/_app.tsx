/* eslint-disable react/prop-types */
import React from 'react';

import './../styles/app.css';

import { ThemeProvider } from 'styled-components';

const theme = {
  colors: {
    title: 'purple',
  },
};

const BootstrapApp = ({ Component, pageProps }): JSX.Element => {
  process.env.GOLDSTACK_DEPLOYMENT =
    process.env.NEXT_PUBLIC_GOLDSTACK_DEPLOYMENT;
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
};

export default BootstrapApp;
