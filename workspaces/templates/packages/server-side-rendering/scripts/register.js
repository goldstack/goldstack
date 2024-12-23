/* eslint-disable @typescript-eslint/no-var-requires */
const { register: registerCss } = require('node-css-require');
const { register: registerSWC } = require('@swc-node/register/register');

registerSWC({});

registerCss();
