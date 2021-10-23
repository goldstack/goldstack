import webpack from 'webpack';
import path from 'path';
import { assertFileExists } from '@goldstack/utils-sh';

export interface PackageEdgeLambdaParams {
  sourceFile: string;
  destFile: string;
}

export const packageEdgeLambda = async (
  params: PackageEdgeLambdaParams
): Promise<void> => {
  assertFileExists(params.sourceFile);
  await new Promise<void>((resolve, reject) => {
    webpack(
      {
        mode: 'production',
        entry: `${params.sourceFile}`,
        target: 'node',
        output: {
          libraryTarget: 'commonjs2',
          path: path.dirname(path.resolve(params.destFile)),
          filename: `${path.relative(
            path.dirname(params.destFile),
            params.destFile
          )}`,
        },
      },
      (err, stats) => {
        if (err || stats.hasErrors()) {
          reject();
          return;
        }
        resolve();
      }
    );
  });
  assertFileExists(path.resolve(params.destFile));
};
