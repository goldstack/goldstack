import { assertFileExists, read } from '@goldstack/utils-sh';
import { build } from 'esbuild';
import path from 'path';

export interface PackageCloudFrontFunctionParams {
  sourceFile: string;
  destFile: string;
}

export const packageCloudFrontFunction = async (
  params: PackageCloudFrontFunctionParams,
): Promise<void> => {
  assertFileExists(params.sourceFile);

  // config via https://github.com/evanw/esbuild/issues/1832#issuecomment-1404910577
  const res = await build({
    outfile: params.destFile,
    entryPoints: [params.sourceFile],
    minify: false,
    minifyIdentifiers: false,
    format: 'cjs',
    banner: {
      js: 'var module = {}; var exports = {};',
    },
    treeShaking: false,
    // legalComments: 'none',
    bundle: true,
    target: 'es5',
    logLevel: 'info',
    supported: {
      'const-and-let': true,
      'exponent-operator': true,
      'template-literal': true,
      arrow: true,
      'rest-argument': true,
      'regexp-named-capture-groups': true,
      'async-await': true,
      'unicode-escapes': true,
    },
    // plugins: [CloudFrontFunctionsPlugin({ runtimeVersion: 2 })],
    // loader: { '.json': 'text' },
  });

  if (res.errors && res.errors.length > 0) {
    throw new Error(
      `Build errors for CloudFront function ${res.errors.map((er) => er.text).join(',')}`,
    );
  }

  assertFileExists(path.resolve(params.destFile));
};
