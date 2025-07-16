import { compileBundle } from '@goldstack/template-ssr-server-compile-bundle';
import type {
  BuildConfiguration,
  ClientBuildOptionsArgs,
  ServerBuildOptionsArgs,
} from '@goldstack/template-ssr-server-compile-bundle';
export type { BuildConfiguration, ClientBuildOptionsArgs, ServerBuildOptionsArgs };

import {
  generateFunctionName,
  getOutDirForLambda,
  type LambdaConfig,
} from '@goldstack/utils-aws-lambda';
import { debug } from '@goldstack/utils-log';
import { mkdir, write } from '@goldstack/utils-sh';
import path from 'path';

export const buildBundles = async ({
  routesDir,
  configs,
  lambdaNamePrefix,
  buildConfig,
  deploymentName,
  packageRootDir,
}: {
  routesDir: string;
  configs: LambdaConfig[];
  lambdaNamePrefix: string;
  buildConfig: BuildConfiguration;
  deploymentName: string;
  packageRootDir: string;
}): Promise<void> => {
  for await (const config of configs) {
    const destDir = getOutDirForLambda(packageRootDir, config);
    mkdir('-p', destDir);
    const functionName = generateFunctionName(lambdaNamePrefix, config);

    debug(`[${functionName}] Building function`, {
      destinationDirectory: destDir,
    });

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
        path.join(packageRootDir, `distLambda/zips/${functionName}.client.meta.json`),
      );
    }
  }
};
