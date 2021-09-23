/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const sveltePreprocess = require('svelte-preprocess');

console.log('INIT PREPROCESS');

module.exports = {
  preprocess: sveltePreprocess({}),
};
