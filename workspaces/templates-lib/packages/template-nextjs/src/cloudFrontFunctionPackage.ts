import { assertFileExists } from '@goldstack/utils-sh';
import { build } from 'esbuild';
import path from 'path';
import { read } from '@goldstack/utils-sh';

export interface PackageCloudFrontFunctionParams {
  sourceFile: string;
  destFile: string;
}

export const packageCloudFrontFunction = async (
  params: PackageCloudFrontFunctionParams,
): Promise<string> => {
  assertFileExists(params.sourceFile);

  const res = await build({
    outfile: params.destFile,
    entryPoints: [params.sourceFile],
    format: 'iife', // Immediately Invoked Function Expression for CloudFront Functions
    platform: 'browser', // CloudFront Functions run in a browser-like environment
    target: 'es2020', // Modern JavaScript
    bundle: true,
    globalName: 'handler', // Export handler globally
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
