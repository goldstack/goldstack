import React from 'react';
import { SSRHandler } from '@goldstack/template-ssr';

import { renderPage, hydrate } from './../render';

const Posts = (props: { posts: string[] }): JSX.Element => {
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
export const handler: SSRHandler = async (event, context) => {
  return renderPage({
    component: Posts,
    appendToHead: '<title>Posts</title>',
    properties: {
      posts: ['post1', 'post2', 'post3', 'posts4'],
    },

    entryPoint: __filename,
    event: event,
  });
};

hydrate(Posts);

export default Posts;
