import { OnLoadArgs, OnLoadResult, Plugin, PluginBuild } from 'esbuild';
import fs from 'fs';
import { compileCss } from 'node-css-require';

const cssServerPlugin: Plugin = {
  name: 'css-plugin-server',
  setup: (build: PluginBuild) => {
    build.onLoad(
      {
        filter: /\.css$/,
      },
      async (args: OnLoadArgs): Promise<OnLoadResult> => {
        const text = await fs.promises.readFile(args.path, 'utf8');
        const js = compileCss(text, args.path).js;

        return {
          contents: js,
          loader: 'js',
        };
      }
    );
  },
};

const pluginFactory = (): Plugin => cssServerPlugin;

export default pluginFactory;
