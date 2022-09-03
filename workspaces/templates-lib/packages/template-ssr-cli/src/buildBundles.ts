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
  lambdaNamePrefix: string;
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
    /**
     * Generate static file names without prefix to have them transferable between different deployments.
     */
    const functionNameWithoutPrefix = generateFunctionName(undefined, config);

    const sourceMapFileName = `${functionName}.map`;
    if (compileResult.sourceMap) {
      await buildConfig.staticFileMapper.put({
        name: sourceMapFileName,
        generatedName: `${functionNameWithoutPrefix}.[hash].map.json`,
        content: compileResult.sourceMap,
      });
    } else {
      await buildConfig.staticFileMapper.remove({ name: sourceMapFileName });
    }
    let sourceMapComment = '';
    if (compileResult.sourceMap) {
      const sourceMapPath = await buildConfig.staticFileMapper.resolve({
        name: sourceMapFileName,
      });
      sourceMapComment = `\n//# sourceMappingURL=/_goldstack/static/generated/${sourceMapPath}`;
    }

    await buildConfig.staticFileMapper.put({
      name: `${functionName}-bundle.js`,
      generatedName: `${functionNameWithoutPrefix}-bundle.[hash].js`,
      content: compileResult.bundle + sourceMapComment,
    });

    if (compileResult.metaFile) {
      write(
        compileResult.metaFile,
        `./distLambda/zips/${functionName}.client.meta.json`
      );
    }
  }
};
