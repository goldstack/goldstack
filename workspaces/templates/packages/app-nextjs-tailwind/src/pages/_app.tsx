// biome-ignore lint/correctness/noUnusedImports: React
import React from 'react';
import './globals.css';

const App = ({ Component, pageProps }): JSX.Element => {
  process.env.GOLDSTACK_DEPLOYMENT = process.env.NEXT_PUBLIC_GOLDSTACK_DEPLOYMENT;
  return <Component {...pageProps} />;
};

export default App;
