/* esbuild-ignore ui */
/* esbuild-ignore server */

import type {
  BuildConfiguration,
  ClientBuildOptionsArgs,
  ServerBuildOptionsArgs,
} from '@goldstack/template-ssr';
import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp';
import type { BuildOptions } from 'esbuild';
import ignorePlugin from 'esbuild-ignore-with-comments-plugin';
import cssPlugin from 'esbuild-ssr-css-modules-plugin';
import tailwindPlugin from 'esbuild-tailwind-ssr-plugin';
import fs from 'fs';
import { StaticFileMapperBuild } from 'static-file-mapper-build';

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
          tailwindPlugin({
            css: fs.readFileSync('./src/root.css').toString(),
            staticFileMapper: getStaticFileMapper(),
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
          'mock-aws-s3-v3', // for s3 mock
          'testcontainers',
          'aws-sdk-client-mock', // for s3 and ses mocks
          '@goldstack/template-ssr-server', // this is only required on the server side
        ],
        minify: true,
        sourcemap: 'inline',
        metafile: false,
        platform: 'browser',
        format: 'iife',
        jsx: 'automatic',
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
          // 'aws-sdk', // included in Lambda runtime environment
          'mock-aws-s3-v3', // for s3 mock
          'testcontainers',
          'aws-sdk-client-mock', // for s3 and ses mocks
        ],
        minify: true,
        platform: 'node',
        format: 'cjs',
        target: 'node20.0',
        treeShaking: true,
        jsx: 'automatic',
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
