import { clientBundleFileName } from '@goldstack/template-ssr-server';
import { compileBundle } from '@goldstack/template-ssr-server-compile-bundle';
import {
  generateFunctionName,
  getOutDirForLambda,
  LambdaConfig,
} from '@goldstack/utils-aws-lambda';
import { mkdir, write } from '@goldstack/utils-sh';

export const buildBundles = async ({
  routesDir,
  configs,
  lambdaNamePrefix,
}: {
  routesDir: string;
  configs: LambdaConfig[];
  lambdaNamePrefix?: string;
}): Promise<void> => {
  for await (const config of configs) {
    const destDir = getOutDirForLambda(config);
    mkdir('-p', destDir);
    const functionName = generateFunctionName(lambdaNamePrefix, config);
    const compileResult = await compileBundle({
      entryPoint: `${routesDir}/${config.relativeFilePath}`,
      sourceMap: true,
      includeCss: false,
      metaFile: true,
    });
    const clientJsBundleFileName = `${destDir}/${clientBundleFileName}`;
    write(compileResult.bundle, clientJsBundleFileName);
    const sourceMapFileName = `${clientJsBundleFileName}.map`;
    write(compileResult.sourceMap || '', sourceMapFileName);
    write(
      compileResult.metaFile || '',
      `./distLambda/zips/${functionName}.client.meta.json`
    );
  }
};
