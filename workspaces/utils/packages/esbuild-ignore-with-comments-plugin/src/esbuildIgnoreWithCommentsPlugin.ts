import { OnLoadArgs, OnLoadResult, Plugin, PluginBuild } from 'esbuild';

import fs from 'fs';

export interface IgnoreWithCommentsPluginOptions {
  ignore: string[];
}

const ignorePlugin = (opts?: IgnoreWithCommentsPluginOptions): Plugin => {
  return {
    name: 'ignore-with-comments-plugin',
    setup: (build: PluginBuild) => {
      build.onResolve({ filter: /.*/, namespace: 'ignore' }, (args) => {
        return {
          path: args.path,
          namespace: 'ignore',
        };
      });

      build.onLoad(
        {
          filter: /\.(ts|tsx)$/,
        },
        async (args: OnLoadArgs): Promise<OnLoadResult> => {
          const text = await fs.promises.readFile(args.path, 'utf8');

          return {
            contents: text,
            loader: 'ts',
          };
        }
      );
    },
  };
};

export function findComments(text: string): string[] {
  const commentRegex = /^\/* esbuildignore (?<ignoreGroups>^\s)/gi;

  const matches = commentRegex.exec(text);
  console.log(matches);
  return [];
}

const pluginFactory = (opts?: IgnoreWithCommentsPluginOptions): Plugin => {
  return ignorePlugin(opts);
};

export default pluginFactory;
