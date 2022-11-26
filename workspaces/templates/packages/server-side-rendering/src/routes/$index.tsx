import React, { useState } from 'react';
import { SSRHandler } from '@goldstack/template-ssr';

import { renderPage, hydrate } from './../render';
import Panel from './../components/Panel';
import styles from './$index.module.css';

import { performClientAuth } from '@goldstack/user-management';

const Index = (props: { message: string }): JSX.Element => {
  const [clicked, setClicked] = useState(false);
  const [token, setToken] = useState<string | undefined | 'error'>(undefined);
  if (!token) {
    performClientAuth()
      .then((token) => setToken(token))
      .catch((e) => {
        setToken('error');
        console.log(e);
      });
  }
  return (
    <>
      <div
        onClick={() => {
          alert('hi');
          setClicked(true);
          throw new Error('Havent seen this');
        }}
        className={`${styles.message}`}
      >
        {props.message}
        {token}
      </div>
      {clicked && <Panel />}
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: SSRHandler = async (event, context) => {
  return renderPage({
    component: Index,
    appendToHead: '<title>SSR Template</title>',
    properties: {
      message: 'Hi there',
    },
    entryPoint: __filename,
    event,
  });
};

hydrate(Index);

export default Index;
