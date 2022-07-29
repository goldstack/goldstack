import { OnLoadArgs, OnLoadResult, Plugin, PluginBuild } from 'esbuild';
import fs from 'fs';
import { compileCss } from 'node-css-require';
import sha256 from 'sha256';

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

const cssPlugin: Plugin = {
  name: 'css-plugin-client',
  setup: (build: PluginBuild) => {
    build.onLoad(
      {
        filter: /\.css$/,
      },
      async (args: OnLoadArgs): Promise<OnLoadResult> => {
        const text = await fs.promises.readFile(args.path, 'utf8');
        const res = compileCss(text, args.path);

        const js = `${await generateCSSInject(args.path, res.css)}\n${res.js}`;
        return {
          contents: js,
          loader: 'js',
        };
      }
    );
  },
};

const pluginFactory = (): Plugin => cssPlugin;

export default pluginFactory;
