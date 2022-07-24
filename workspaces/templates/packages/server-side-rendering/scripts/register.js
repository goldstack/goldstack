/* eslint-disable @typescript-eslint/no-var-requires */
const { addHook } = require('pirates');

const postcss = require('postcss');
const postcssModules = require('postcss-modules-sync');

function compile(code, filename) {
  let exportedTokens = {};
  const res = postcss([
    postcssModules.default({
      generateScopedName: '[path][local]-[hash:base64:10]',
      getJSON: (tokens) => {
        console.log(tokens);
        exportedTokens = tokens;
      },
    }),
  ]).process(code);

  console.log(res.css);
  console.log(exportedTokens);

  const js = `module.exports = JSON.parse('${JSON.stringify(
    exportedTokens
  )}');`;

  console.log(js);
  return js;
}

addHook((code, filename) => compile(code, filename), {
  exts: ['.css'],
});

const { register } = require('@swc-node/register/register');

register({});
