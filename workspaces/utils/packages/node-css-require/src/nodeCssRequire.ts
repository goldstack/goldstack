/* eslint-disable @typescript-eslint/no-var-requires */
import { addHook } from 'pirates';

import postcss, { AcceptedPlugin } from 'postcss';
import postcssModules from 'postcss-modules-sync';
import { register as swcRegister } from '@swc-node/register/register';

export interface CompileCssResult {
  css: string;
  js: string;
}

export interface CompileCssConfiguration {
  plugins?: AcceptedPlugin[];
  generateScopedName?: string;
}

export function compileCss(
  code: string,
  filename: string,
  config?: CompileCssConfiguration
): CompileCssResult {
  let exportedTokens = {};
  const plugins = [
    postcssModules({
      generateScopedName:
        config?.generateScopedName || '[path][local]-[hash:base64:10]',
      getJSON: (tokens) => {
        exportedTokens = tokens;
      },
    }),
  ];
  if (config?.plugins) {
    plugins.push(...config.plugins);
  }
  const res = postcss(plugins).process(code, { from: filename });

  // the below is required to properly resolve `exportedTokens`
  res
    .then(() => {
      // all good
    })
    .catch((e) => {
      throw new Error(`Cannot compile CSS ${e.message}`);
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

  const tsConfig = {};
  swcRegister({ ...tsConfig });
};
