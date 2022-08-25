import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp';

import cssPlugin from 'esbuild-css-modules-client-plugin';

import type { BuildOptions } from 'esbuild';

import type { ESBuildConfiguration } from '@goldstack/template-ssr';

export const esbuildConfig = (): ESBuildConfiguration => {
  return {
    createBuildOptions: (includeCss: boolean): BuildOptions => {
      return {
        plugins: [
          cssPlugin({
            excludeCSSInject: !includeCss,
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
  };
};
