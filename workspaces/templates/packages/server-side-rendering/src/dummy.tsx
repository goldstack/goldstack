import React from 'react';
// import Index from './routes/$index';
import { renderToString } from 'react-dom/server';

// const el = renderToString(<Index message="jh" />);
const el = renderToString(<div>hjey</div>);

console.log(el);
