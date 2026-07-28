import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import React, { useState } from 'react';
import Panel from './../components/Panel';
import { hydrate, renderPage } from './../render';
import { addCacheHeaders } from '../utils/cacheHeaders';
import styles from './$index.module.css';
const Index = (props) => {
  const [clicked, setClicked] = useState(false);
  return _jsxs(_Fragment, {
    children: [
      _jsx('div', {
        onClick: () => {
          alert('hi');
          setClicked(true);
          throw new Error('Havent seen this');
        },
        className: `m-20 ${styles.message}`,
        children: props.message,
      }),
      clicked && _jsx(Panel, {}),
    ],
  });
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler = async (event, _context) => {
  const message = 'Hi there!';
  const response = await renderPage({
    component: Index,
    appendToHead: '<title>SSR Template</title>',
    properties: {
      message,
    },
    entryPoint: __filename,
    event,
  });
  // Add cache headers based on route path
  return addCacheHeaders(response, event.rawPath || '/');
};
hydrate(Index);
export default Index;
//# sourceMappingURL=$index.js.map
