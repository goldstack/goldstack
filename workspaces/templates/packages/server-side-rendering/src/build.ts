/* esbuild-ignore ui */
/* esbuild-ignore server */

import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp';

import cssPlugin from 'esbuild-ssr-css-modules-plugin';

import ignorePlugin from 'esbuild-ignore-with-comments-plugin';

import type { BuildOptions } from 'esbuild';

import { StaticFileMapperBuild } from 'static-file-mapper-build';

import type {
  BuildConfiguration,
  ClientBuildOptionsArgs,
  ServerBuildOptionsArgs,
} from '@goldstack/template-ssr';

function getStaticFileMapper(): StaticFileMapperBuild {
  return new StaticFileMapperBuild({
    dir: './static/generated',
    storePath: './src/state/staticFiles.json',
  });
}

const buildConfig = (): BuildConfiguration => {
  return {
    staticFileMapper: getStaticFileMapper(),
    createClientBuildOptions: (args: ClientBuildOptionsArgs): BuildOptions => {
      return {
        plugins: [
          ignorePlugin({ ignore: ['ui'] }),
          cssPlugin({
            jsCSSInject: args.includeCss,
            cssConfig: {
              plugins: [],
            },
          }),
          pnpPlugin(),
        ],
        bundle: true,
        outfile: '/dist/tmp/bundle.js', // this is used for nothing. But if not supplying it, CSS modules plugin fails
        external: [
          'esbuild',
          '@yarnpkg/esbuild-plugin-pnp',
          '@swc/core',
          '@swc/jest',
          '@goldstack/template-ssr-server', // this is only required on the server side
        ],
        minify: true,
        sourcemap: 'inline',
        metafile: false,
        platform: 'browser',
        format: 'iife',
        treeShaking: true,
      };
    },
    createServerBuildOptions: (args: ServerBuildOptionsArgs): BuildOptions => {
      return {
        plugins: [
          ignorePlugin({ ignore: ['server'] }),
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
        metafile: false,
      };
    },
  };
};

export default buildConfig;
