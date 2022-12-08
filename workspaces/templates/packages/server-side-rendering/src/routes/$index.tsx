import React, { useState } from 'react';
import { SSRHandler } from '@goldstack/template-ssr';

import { renderPage, hydrate } from './../render';
import Panel from './../components/Panel';
import styles from './$index.module.css';

import {
  getLoggedInUser,
  handleRedirectCallback,
  loginWithRedirect,
  performLogout,
  connectWithCognito,
} from '@goldstack/user-management';

const Index = (props: { message: string }): JSX.Element => {
  const user = getLoggedInUser();
  handleRedirectCallback();

  const [clicked, setClicked] = useState(false);
  return (
    <>
      <div
        onClick={() => {
          alert('hi');
          setClicked(true);
          loginWithRedirect();
          // performLogout();
          // throw new Error('Havent seen this');
        }}
        className={`${styles.message}`}
      >
        {props.message}
        {user ? <p>Logged In</p> : <p>Not logged in </p>}
      </div>
      {!user && (
        <button
          onClick={() => {
            loginWithRedirect();
          }}
        >
          Login
        </button>
      )}

      {user && (
        <button
          onClick={() => {
            performLogout();
          }}
        >
          Logout
        </button>
      )}
      {clicked && <Panel />}
    </>
  );
};

function getCookies(arg: any): any {
  return '';
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: SSRHandler = async (event, context) => {
  const cookies = getCookies((event.cookies || []).join(';'));
  if (cookies.goldstack_access_token) {
    const cognito = await connectWithCognito();
    await cognito.validate(cookies.goldstack_access_token);
    const idToken = await cognito.validateIdToken(cookies.goldstack_id_token);
    console.log(idToken.email);
  }

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
