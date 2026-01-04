/* eslint-disable @typescript-eslint/no-var-requires */
import { addHook } from 'pirates';

import postcss, { type AcceptedPlugin } from 'postcss';
import postcssModules from 'postcss-modules';

const postcssModulesSync =
  require('postcss-modules-sync').default ?? require('postcss-modules-sync');

// import { register as swcRegister } from '@swc-node/register/register';

import { createHash } from 'crypto';

export type { AcceptedPlugin } from 'postcss';

export interface CompileCssResult {
  css: string;
  js: string;
}

export interface CompileCssConfiguration {
  plugins?: AcceptedPlugin[];
  generateScopedName?: string;
}

function generateScopedName(name: string, _filename: string, css: string) {
  const i = css.indexOf(`.${name}`);
  const lineNumber = css.substr(0, i).split(/[\r\n]/).length;
  const hash = createHash('md5').update(css).digest('hex');

  return `${name}_${hash}_${lineNumber}`;
}

export async function compileCss(
  code: string,
  filename: string,
  config?: CompileCssConfiguration,
): Promise<CompileCssResult> {
  let exportedTokens = {};
  const plugins: AcceptedPlugin[] = [
    postcssModules({
      generateScopedName: generateScopedName,
      getJSON: (_cssFileName, json, _outputFileName) => {
        exportedTokens = json;
      },
    }),
  ];
  let res = postcss(plugins).process(code, { from: filename });

  await res;

  // apply other postcss magic after class names have been mapped
  if (config?.plugins && config.plugins.length > 0) {
    res = postcss(config.plugins).process(res.css, { from: filename });
    await res;
  }

  const js = `module.exports = JSON.parse('${JSON.stringify(exportedTokens)}');`;

  return {
    js,
    css: res.css,
  };
}

export function compileCssSync(
  code: string,
  filename: string,
  config?: CompileCssConfiguration,
): CompileCssResult {
  let exportedTokens = {};
  const plugins = [
    postcssModulesSync({
      generateScopedName: generateScopedName,
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

  const js = `module.exports = JSON.parse('${JSON.stringify(exportedTokens)}');`;
  return {
    js,
    css: res.css,
  };
}

function compileJsSync(code: string, filename: string): string {
  return compileCssSync(code, filename).js;
}

export const register = (): void => {
  addHook((code, filename) => compileJsSync(code, filename), {
    exts: ['.css'],
  });

  const _tsConfig = {};
  // swcRegister({ ...tsConfig });
};
