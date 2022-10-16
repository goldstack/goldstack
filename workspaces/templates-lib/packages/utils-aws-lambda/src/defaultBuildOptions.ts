import type { BuildOptions } from 'esbuild';
import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp';
import cssPlugin from 'esbuild-ssr-css-modules-plugin';
import { ServerBuildOptionsArgs } from './buildFunctions';

export function defaultBuildOptions(): (
  args: ServerBuildOptionsArgs
) => BuildOptions {
  return function (args: ServerBuildOptionsArgs): BuildOptions {
    return {
      plugins: [
        cssPlugin({
          jsCSSInject: false,
          onCSSGenerated: args.onCSSGenerated,
        }),
        pnpPlugin(),
      ],
      bundle: true,
      external: [
        'aws-sdk', // included in Lambda runtime environment
      ],
      minify: true,
      platform: 'node',
      format: 'cjs',
      target: 'node16.0',
      treeShaking: true,
      define: {
        'process.env.NODE_ENV': '"production"',
      }, // see https://github.com/evanw/esbuild/issues/2377
      sourcemap: true,
      metafile: true,
    };
  };
}
