import React, { useState } from 'react';
import { SSRHandler } from '@goldstack/template-ssr';

import { renderPage, hydrate } from './../render';
import Panel from './../components/Panel';
import styles from './$index.module.css';

import {
  performClientAuth,
  performLogout,
  connectWithCognito,
} from '@goldstack/user-management';

const Index = (props: { message: string }): JSX.Element => {
  const [clicked, setClicked] = useState(false);
  const [token, setToken] = useState<string | undefined | 'error'>(undefined);
  if (!token) {
    performClientAuth()
      .then((token) => setToken(token?.accessToken))
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
          performLogout();
          // throw new Error('Havent seen this');
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

function getCookies(rc: string): any {
  const list = {};

  rc.split(';').forEach(function (cookie) {
    const parts = cookie.split('=');
    const shift = parts.shift();
    if (!shift) {
      return;
    }
    const key = shift.trim();
    const value = decodeURI(parts.join('='));
    if (key != '') {
      list[key] = value;
    }
  });
  return list;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: SSRHandler = async (event, context) => {
  let message = 'Hi there';
  const cookies = getCookies((event.cookies || []).join(';'));
  if (cookies.goldstack_access_token) {
    const cognito = await connectWithCognito();
    await cognito.validate(cookies.goldstack_access_token);
    const idToken = await cognito.validateIdToken(cookies.goldstack_id_token);
    message = `Hello ${idToken.email}<br>`;
  } else {
  }

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
