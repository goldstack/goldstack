import type { OnLoadArgs, OnLoadResult, Plugin, PluginBuild } from 'esbuild';
import fs from 'fs';
import { compileCss, type CompileCssConfiguration } from 'node-css-require';
import sha256 from 'sha256';

export type { CompileCssConfiguration } from 'node-css-require';

export interface CSSClientPluginOptions {
  jsCSSInject?: boolean;
  onCSSGenerated?: (css: string) => void;
  cssConfig?: CompileCssConfiguration;
}

async function generateCSSInject(sourcePath: string, css: string) {
  const styleId = sha256(sourcePath);

  return `(function(){
        if (!document.getElementById('${styleId}')) {
            var e = document.createElement('style');
            e.id = '${styleId}';
            e.textContent = \`${css}\`;
            document.head.appendChild(e);
        }
    })();`;
}

const cssPlugin = (opts?: CSSClientPluginOptions): Plugin => {
  return {
    name: 'css-plugin-client',
    setup: (build: PluginBuild) => {
      build.onLoad(
        {
          filter: /\.css$/,
        },
        async (args: OnLoadArgs): Promise<OnLoadResult> => {
          const text = await fs.promises.readFile(args.path, 'utf8');
          const res = await compileCss(text, args.path, opts?.cssConfig);

          let js: string;
          if (opts?.jsCSSInject) {
            js = `${await generateCSSInject(args.path, res.css)}\n${res.js}`;
          } else {
            js = res.js;
          }
          if (opts?.onCSSGenerated) {
            opts.onCSSGenerated(res.css);
          }
          return {
            contents: js,
            loader: 'js',
          };
        }
      );
    },
  };
};

const pluginFactory = (opts?: CSSClientPluginOptions): Plugin => {
  return cssPlugin(opts);
};

export default pluginFactory;
