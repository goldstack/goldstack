/* eslint-disable @typescript-eslint/no-var-requires */
import { addHook } from 'pirates';

import postcss from 'postcss';
import postcssModules from 'postcss-modules-sync';
import { register as swcRegister } from '@swc-node/register/register';
import { readDefaultTsConfig } from '@swc-node/register/read-default-tsconfig';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function compile(code: string, filename: string): string {
  let exportedTokens = {};
  const res = postcss([
    postcssModules({
      generateScopedName: '[path][local]-[hash:base64:10]',
      getJSON: (tokens) => {
        exportedTokens = tokens;
      },
    }),
  ]).process(code);

  // the below is required to properly resolve `exportedTokens`
  res
    .then(() => {
      // all good
    })
    .catch((e) => {
      throw new Error(`Cannot compile CSS ${e.message}`, e);
    });

  const js = `module.exports = JSON.parse('${JSON.stringify(
    exportedTokens
  )}');`;
  return js;
}

export const register = (): void => {
  addHook((code, filename) => compile(code, filename), {
    exts: ['.css'],
  });

  let tsConfig = readDefaultTsConfig();
  tsConfig = {};
  swcRegister({ ...tsConfig });
};
