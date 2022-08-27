import type { BuildOptions } from 'esbuild';
import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp';
import cssPlugin from 'esbuild-css-modules-client-plugin';

export function defaultBuildOptions(): (args: {
  onCSSGenerated: (css: string) => void;
}) => BuildOptions {
  return function (args: {
    onCSSGenerated: (css: string) => void;
  }): BuildOptions {
    return {
      plugins: [
        cssPlugin({
          excludeCSSInject: true,
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
