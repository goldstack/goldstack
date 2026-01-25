import type { OnLoadArgs, OnLoadResult, Plugin, PluginBuild } from 'esbuild';
import fs from 'fs';
import { type CompileCssConfiguration, compileCss } from 'node-css-require';
import sha256 from 'sha256';
import path from 'path';

export type { CompileCssConfiguration } from 'node-css-require';

export interface CSSClientPluginOptions {
  jsCSSInject?: boolean;
  onCSSGenerated?: (css: string) => void;
  cssConfig?: CompileCssConfiguration;
}

/**
 * Custom resolve function for postcss-modules to handle Windows drive letter case sensitivity.
 * This fixes the "Failed to obtain root" error when process.cwd() returns lowercase drive letters on Windows.
 */
function createResolveFunction() {
  return (filePath: string, importer: string): string => {
    // Handle @ imports by resolving relative to the current working directory
    if (filePath.startsWith('@')) {
      // Get the normalized current working directory with uppercase drive letter
      const cwd = process.cwd();
      const normalizedCwd = cwd.replace(/^([a-z]):/, (_, letter) => letter.toUpperCase() + ':');
      return path.resolve(normalizedCwd, filePath.substring(1));
    }

    // Handle relative imports
    return path.resolve(path.dirname(importer), filePath);
  };
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

          // Create enhanced CSS config with custom resolve function to fix Windows drive letter issue
          const enhancedCssConfig: CompileCssConfiguration = {
            ...opts?.cssConfig,
            resolve: createResolveFunction(),
          };

          const res = await compileCss(text, args.path, enhancedCssConfig);

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
        },
      );
    },
  };
};

const pluginFactory = (opts?: CSSClientPluginOptions): Plugin => {
  return cssPlugin(opts);
};

export default pluginFactory;
