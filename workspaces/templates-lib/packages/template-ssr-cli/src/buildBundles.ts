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
  deploymentName,
}: {
  routesDir: string;
  configs: LambdaConfig[];
  lambdaNamePrefix?: string;
  buildConfig: BuildConfiguration;
  deploymentName: string;
}): Promise<void> => {
  for await (const config of configs) {
    const destDir = getOutDirForLambda(config);
    mkdir('-p', destDir);
    const functionName = generateFunctionName(lambdaNamePrefix, config);
    const compileResult = await compileBundle({
      entryPoint: `${routesDir}/${config.relativeFilePath}`,
      buildOptions: {
        includeCss: false,
        deploymentName,
      },
      buildConfig,
    });
    const clientJsBundleFileName = `${destDir}/${clientBundleFileName}`;
    write(compileResult.bundle, clientJsBundleFileName);
    const sourceMapFileName = `${functionName}.map`;
    if (compileResult.sourceMap) {
      buildConfig.staticFileMapper.put({
        name: sourceMapFileName,
        generatedName: `${functionName}.[hash].map.json`,
        content: compileResult.sourceMap,
      });
    } else {
      buildConfig.staticFileMapper.remove({ name: sourceMapFileName });
    }

    if (compileResult.metaFile) {
      write(
        compileResult.metaFile,
        `./distLambda/zips/${functionName}.client.meta.json`
      );
    }
  }
};
