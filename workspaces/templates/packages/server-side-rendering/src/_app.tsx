import React from 'react';

import type { ComponentType } from 'react';

const Wrapped = ({
  Component,
  pageProps,
}: {
  Component: ComponentType;
  pageProps: any;
}): JSX.Element => {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
};

export default Wrapped;
