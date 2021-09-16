/* eslint-disable @typescript-eslint/no-var-requires */
const Jester = require('svelte-jester');
const tsJest = require('ts-jest');
const sveltePreprocess = require('svelte-preprocess');
const svelte = require('svelte/compiler');
const makeSynchronous = require('make-synchronous');
console.log('Load transformer');

module.exports = {
  process(src, filename) {
    let result = undefined;
    let done = false;
    const process = makeSynchronous(async number => {
     const preprocessResult = await svelte
      .preprocess(src, { preprocess: sveltePreprocess }, { filename });
 
      console.log(preprocessResult);
      result = Jester.createTransformer({
        preprocess: false,
      }).process(preprocessResult.code, filename);
      done = true;

      return result;
    });
    
    // deasync.loopWhile(function () {
    //   return !done;
    // });
    return process();
  },
};
