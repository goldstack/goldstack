import type { SSRHandler } from '@goldstack/template-ssr';
import React from 'react';
import { hydrate, renderPage } from './../render';
import { addCacheHeaders } from '../utils/cacheHeaders';

const Posts = (props: { posts: string[] }): React.ReactNode => {
  return (
    <>
      <p>Posts:</p>
      {props.posts.map((p, idx) => (
        <div key={idx}>{p}</div>
      ))}
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: SSRHandler = async (event, _context) => {
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
