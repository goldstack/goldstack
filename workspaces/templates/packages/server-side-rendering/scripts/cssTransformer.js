/* eslint-disable @typescript-eslint/no-var-requires */

let compileCss;
try {
  compileCss = require('node-css-require').compileCss;
} catch (e) {
  // Fallback require for local development - Jest does not support loading transformers from .ts source files
  // so we load directly from the compiled JS.
  compileCss = require('node-css-require/dist/src/nodeCssRequire').compileCss;
}

module.exports = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  process(sourceText, sourcePath, options) {
    const js = compileCss(sourceText, sourcePath).js;
    return {
      // TODO: to actual implementation with postcss / css modules
      code: js,
    };
  },
};
