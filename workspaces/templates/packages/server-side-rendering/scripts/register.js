/* eslint-disable @typescript-eslint/no-var-requires */
const { addHook } = require('pirates');

const postcss = require('postcss');
const postcssModules = require('postcss-modules-sync');
const { register } = require('@swc-node/register/register');
const {
  readDefaultTsConfig,
} = require('@swc-node/register/read-default-tsconfig');

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

  const js = `module.exports = JSON.parse('${JSON.stringify(
    exportedTokens
  )}');`;
  // styles in res.css
  return js;
}

addHook((code, filename) => compile(code, filename), {
  exts: ['.css'],
});

let tsConfig = readDefaultTsConfig();
tsConfig = {};
register({ ...tsConfig });
