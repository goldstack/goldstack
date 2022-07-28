/* eslint-disable @typescript-eslint/no-var-requires */
import { addHook } from 'pirates';

import postcss from 'postcss';
import postcssModules from 'postcss-modules-sync';
import { register as swcRegister } from '@swc-node/register/register';
import { readDefaultTsConfig } from '@swc-node/register/read-default-tsconfig';

export interface CompileCssResult {
  css: string;
  js: string;
}

export function compileCss(code: string, filename: string): CompileCssResult {
  let exportedTokens = {};
  const res = postcss([
    postcssModules({
      generateScopedName: '[path][local]-[hash:base64:10]',
      getJSON: (tokens) => {
        exportedTokens = tokens;
      },
    }),
  ]).process(code, { from: filename });

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
  return {
    js,
    css: res.css,
  };
}

function compileJs(code: string, filename: string): string {
  return compileCss(code, filename).js;
}

export const register = (): void => {
  addHook((code, filename) => compileJs(code, filename), {
    exts: ['.css'],
  });

  let tsConfig = readDefaultTsConfig();
  tsConfig = {};
  swcRegister({ ...tsConfig });
};
