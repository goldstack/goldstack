import React from 'react';
import type { SSRHandler } from '@goldstack/template-ssr';
import { useState } from 'react';
import Panel from './../components/Panel';
import { hydrate, renderPage } from './../render';
import styles from './$index.module.css';

const Index = (props: { message: string }): React.ReactNode => {
  const [clicked, setClicked] = useState(false);
  return (
    <>
      <div
        onClick={() => {
          alert('hi');
          setClicked(true);
          throw new Error('Havent seen this');
        }}
        className={`m-20 ${styles.message}`}
      >
        {props.message}
      </div>
      {clicked && <Panel />}
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: SSRHandler = async (event, _context) => {
  const message = 'Hi there!';

  return renderPage({
    component: Index,
    appendToHead: '<title>SSR Template</title>',
    properties: {
      message,
    },
    entryPoint: __filename,
    event,
  });
};

hydrate(Index);

export default Index;
