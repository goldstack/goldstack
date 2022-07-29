import { OnLoadArgs, OnLoadResult, Plugin, PluginBuild } from 'esbuild';
import fs from 'fs';
import { compileCss } from 'node-css-require';

export interface CSSServerPluginOptions {
  onCSSGenerated?: (css: string) => void;
}

const cssServerPlugin = (opts?: CSSServerPluginOptions) => {
  return {
    name: 'css-plugin-server',
    setup: (build: PluginBuild) => {
      build.onLoad(
        {
          filter: /\.css$/,
        },
        async (args: OnLoadArgs): Promise<OnLoadResult> => {
          const text = await fs.promises.readFile(args.path, 'utf8');
          const res = compileCss(text, args.path);
          const js = res.js;

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

const pluginFactory = (opts?: CSSServerPluginOptions): Plugin => {
  return cssServerPlugin(opts);
};

export default pluginFactory;
