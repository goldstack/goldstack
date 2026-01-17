import { assertFileExists, read } from '@goldstack/utils-sh';
import { build } from 'esbuild';
// import { CloudFrontFunctionsPlugin } from 'esbuild-cf-functions-plugin';
import path from 'path';

export interface PackageCloudFrontFunctionParams {
  sourceFile: string;
  destFile: string;
}

export const packageCloudFrontFunction = async (
  params: PackageCloudFrontFunctionParams,
): Promise<string> => {
  assertFileExists(params.sourceFile);

  // config from https://github.com/BeeeQueue/esbuild-cf-functions-plugin?tab=readme-ov-file#usage
  const res = await build({
    outfile: params.destFile,
    entryPoints: [params.sourceFile],
    // minify: true,
    format: 'cjs',
    legalComments: 'none',
    bundle: true,
    target: 'es5',
    logLevel: 'info',
    // plugins: [CloudFrontFunctionsPlugin({ runtimeVersion: 2 })],
    // loader: { '.json': 'text' },
  });

  if (res.errors && res.errors.length > 0) {
    throw new Error(
      `Build errors for CloudFront function ${res.errors.map((er) => er.text).join(',')}`,
    );
  }

  assertFileExists(path.resolve(params.destFile));

  // Return the bundled code as a string
  return read(params.destFile);
};
