import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp';

import cssPlugin from 'esbuild-css-modules-client-plugin';

import type { BuildOptions } from 'esbuild';

import type { ESBuildConfiguration } from '@goldstack/template-ssr';

export const esbuildConfig = (): ESBuildConfiguration => {
  return {
    createClientBuildOptions: (includeCss: boolean): BuildOptions => {
      return {
        plugins: [
          cssPlugin({
            excludeCSSInject: !includeCss,
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
        platform: 'browser',
        format: 'iife',
        treeShaking: true,
      };
    },
    createServerBuildOptions: (
      onCSSGenerated: (css: string) => void
    ): BuildOptions => {
      return {
        plugins: [
          cssPlugin({
            excludeCSSInject: true,
            onCSSGenerated,
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
    },
  };
};
