import React from 'react';

const App = ({ Component, pageProps }): React.JSX.Element => {
  process.env.GOLDSTACK_DEPLOYMENT = process.env.NEXT_PUBLIC_GOLDSTACK_DEPLOYMENT;
  return <Component {...pageProps} />;
};

export default App;
