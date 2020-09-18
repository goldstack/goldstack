import React from 'react';
import { useRouter } from 'next/router';

import Header from 'src/components/Header';

const Docs = (): JSX.Element => {
  const { query } = useRouter();

  return (
    <>
      <Header></Header>
      {JSON.stringify(query, null, 2)}
    </>
  );
};

export default Docs;
