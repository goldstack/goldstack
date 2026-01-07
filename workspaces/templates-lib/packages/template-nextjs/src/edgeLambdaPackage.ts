import { assertFileExists } from '@goldstack/utils-sh';
import { build } from 'esbuild';
import path from 'path';

export interface PackageEdgeLambdaParams {
  sourceFile: string;
  destFile: string;
}

export const packageEdgeLambda = async (params: PackageEdgeLambdaParams): Promise<void> => {
  assertFileExists(params.sourceFile);

  const res = await build({
    outfile: params.destFile,
    entryPoints: [params.sourceFile],
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    bundle: true,
  });
  if (res.errors && res.errors.length > 0) {
    throw new Error(`Build errors for Edge lambda ${res.errors.map((er) => er.text).join(',')}`);
  }

  // await new Promise<void>((resolve, reject) => {
  //   try {
  //     webpack(
  //       {
  //         mode: 'production',
  //         entry: `${params.sourceFile}`,
  //         target: 'node',
  //         output: {
  //           libraryTarget: 'commonjs2',
  //           hashFunction: XXHash64,
  //           path: path.dirname(path.resolve(params.destFile)),
  //           filename: `${path.relative(
  //             path.dirname(params.destFile),
  //             params.destFile
  //           )}`,
  //         },
  //       },
  //       (err, stats) => {
  //         if (err || stats.hasErrors()) {
  //           reject(err);
  //           return;
  //         }
  //         resolve();
  //       }
  //     );
  //   } catch (e) {
  //     reject(e);
  //   }
  // });
  assertFileExists(path.resolve(params.destFile));
};
