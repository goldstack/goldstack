import { clientBundleFileName } from '@goldstack/template-ssr-server';
import { compileBundle } from '@goldstack/template-ssr-server-compile-bundle';
import type {
  BuildConfiguration,
  ClientBuildOptionsArgs,
  ServerBuildOptionsArgs,
} from '@goldstack/template-ssr-server-compile-bundle';
export type {
  BuildConfiguration,
  ClientBuildOptionsArgs,
  ServerBuildOptionsArgs,
};

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
  buildConfig,
}: {
  routesDir: string;
  configs: LambdaConfig[];
  lambdaNamePrefix?: string;
  buildConfig: BuildConfiguration;
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
      buildConfig,
    });
    const clientJsBundleFileName = `${destDir}/${clientBundleFileName}`;
    write(compileResult.bundle, clientJsBundleFileName);
    if (compileResult.sourceMap) {
      const sourceMapFileName = `${functionName}.map`;
      buildConfig.staticFileMapper.put({
        name: sourceMapFileName,
        generatedName: `${functionName}.[hash].map.json`,
        content: compileResult.sourceMap,
      });
      // write(compileResult.sourceMap || '', sourceMapFileName);
    }
    write(
      compileResult.metaFile || '',
      `./distLambda/zips/${functionName}.client.meta.json`
    );
  }
};
