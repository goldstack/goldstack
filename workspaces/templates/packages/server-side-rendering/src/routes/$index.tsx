import React, { useState } from 'react';
import { SSRHandler } from '@goldstack/template-ssr';

import { renderPage, hydrate } from './../render';
import Panel from './../components/Panel';
import styles from './$index.module.css';

import {
  getLoggedInUser,
  performClientAuth,
  performLogout,
  setMockedUserAccessToken,
} from '@goldstack/user-management';
const Index = (props: { message: string }): JSX.Element => {
  const user = getLoggedInUser();
  performClientAuth();
  // performLogout();
  const [clicked, setClicked] = useState(false);
  return (
    <>
      <div
        onClick={() => {
          alert('hi');
          setClicked(true);
          // performLogout();
          // throw new Error('Havent seen this');
        }}
        className={`${styles.message}`}
      >
        {props.message}
        {user?.idToken}
      </div>
      {clicked && <Panel />}
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: SSRHandler = async (event, context) => {
  const message = 'Hi there';

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
