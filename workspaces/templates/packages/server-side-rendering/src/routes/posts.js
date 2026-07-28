import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import React from 'react';
import { hydrate, renderPage } from './../render';
import { addCacheHeaders } from '../utils/cacheHeaders';
const Posts = (props) => {
  return _jsxs(_Fragment, {
    children: [
      _jsx('p', { children: 'Posts:' }),
      props.posts.map((p, idx) => _jsx('div', { children: p }, idx)),
    ],
  });
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler = async (event, _context) => {
  const response = await renderPage({
    component: Posts,
    appendToHead: '<title>Posts</title>',
    properties: {
      posts: ['post1', 'post2', 'post3', 'posts4'],
    },
    entryPoint: __filename,
    event: event,
  });
  // Add cache headers based on route path
  return addCacheHeaders(response, event.rawPath || '/posts');
};
hydrate(Posts);
export default Posts;
//# sourceMappingURL=posts.js.map
