import type { OnLoadArgs, OnLoadResult, Plugin, PluginBuild } from 'esbuild';

import fs from 'fs';

export interface IgnoreWithCommentsPluginOptions {
  ignore: string[];
}

const ignorePlugin = (opts?: IgnoreWithCommentsPluginOptions): Plugin => {
  return {
    name: 'ignore-with-comments-plugin',
    setup: (build: PluginBuild) => {
      // build.onResolve({ filter: /.*/, namespace: 'ignore' }, (args) => {
      //   return {
      //     path: args.path,
      //     namespace: 'ignore',
      //   };
      // });

      build.onLoad(
        {
          filter: /\.(ts|tsx)$/,
        },
        async (args: OnLoadArgs): Promise<OnLoadResult> => {
          const text = await fs.promises.readFile(args.path, 'utf8');

          const res = findComments(text);
          if (mustIgnore(res, opts?.ignore)) {
            return {
              contents: 'const dummy = {}; export default dummy;',
              loader: 'ts',
            };
          }
          const type = args.path.endsWith('.ts') ? 'ts' : 'tsx';
          return {
            contents: text,
            loader: type,
          };
        }
      );
    },
  };
};

export function mustIgnore(
  comments: string[],
  ignore: string[] | undefined
): boolean {
  if (comments.length === 0) {
    return false;
  }
  if (!ignore) {
    return true;
  }
  const reducer = (prev: boolean, curr: string): boolean => {
    return (
      prev && comments.find((el) => el === curr || el === '') !== undefined
    );
  };
  return ignore.reduce(reducer, true);
}

export function findComments(text: string): string[] {
  const commentRegex = /^\s*\/\* esbuild-ignore ([^\s\*]*)/gm;
  const res: string[] = [];
  let matches: RegExpExecArray | null;
  do {
    matches = commentRegex.exec(text);

    if (matches && matches.length > 1) {
      res.push(matches[1]);
    }
  } while (matches !== null);

  return res;
}

const pluginFactory = (opts?: IgnoreWithCommentsPluginOptions): Plugin => {
  return ignorePlugin(opts);
};

export default pluginFactory;
