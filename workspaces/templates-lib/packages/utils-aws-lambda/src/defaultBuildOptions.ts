import type { BuildOptions } from 'esbuild';
import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp';
import cssPlugin from 'esbuild-ssr-css-modules-plugin';
import type { ServerBuildOptionsArgs } from './buildFunctions';

export function defaultBuildOptions(): (
  args: ServerBuildOptionsArgs
) => BuildOptions {
  return (args: ServerBuildOptionsArgs): BuildOptions => ({
      plugins: [
        cssPlugin({
          jsCSSInject: false,
          onCSSGenerated: args.onCSSGenerated,
        }),
        pnpPlugin(),
      ],
      bundle: true,
      external: [
        // 'aws-sdk', // included in Lambda runtime environment - sdk v2 not included anymore
        'mock-aws-s3-v3', // for s3 mock
        'testcontainers',
        'aws-sdk-client-mock', // for s3 and ses mocks
      ],
      minify: true,
      platform: 'node',
      format: 'cjs',
      target: 'node18.0',
      treeShaking: true,
      define: {
        'process.env.NODE_ENV': '"production"',
      }, // see https://github.com/evanw/esbuild/issues/2377
      sourcemap: true,
      metafile: true,
    });
}
