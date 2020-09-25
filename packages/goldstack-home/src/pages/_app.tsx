/* eslint-disable react/prop-types */
// ensure all pages have Bootstrap CSS
import '../styles/fonts.css';
import '../styles/app.css';
import React from 'react';

import { ThemeProvider } from 'styled-components';

const theme = {};

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
