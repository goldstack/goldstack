import { assertFileExists, read } from '@goldstack/utils-sh';
import { build } from 'esbuild';
import path from 'path';

export interface PackageCloudFrontFunctionParams {
  sourceFile: string;
  destFile: string;
}

/**
 * The maximum size of a CloudFront Functions bundle. AWS rejects function
 * updates whose code exceeds this limit with `FunctionSizeLimitExceeded`.
 */
export const CLOUDFRONT_FUNCTION_SIZE_LIMIT = 10 * 1024;

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
    minifyWhitespace: true,
    minifySyntax: true,
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

  const size = Buffer.byteLength(read(params.destFile), 'utf8');
  if (size > CLOUDFRONT_FUNCTION_SIZE_LIMIT) {
    throw new Error(
      `Packaged CloudFront function is ${size} bytes, which exceeds the ${CLOUDFRONT_FUNCTION_SIZE_LIMIT} byte (10 KB) CloudFront Functions limit. ` +
        'Avoid bundling large data such as the Next.js routes manifest into the routing handler.',
    );
  }
};
