import { build } from 'esbuild';
import type { BuildOptions } from 'esbuild';
import { LambdaConfig } from './types/LambdaConfig';
import { generateFunctionName } from './generate/generateFunctionName';
import {
  changeExtension,
  mkdir,
  readToType,
  rmSafe,
  write,
} from '@goldstack/utils-sh';
import path from 'path';

export interface ClientBuildOptionsArgs {
  /**
   * Whether CSS should be injected in the bundled JavaScript
   */
  includeCss: boolean;
  /**
   * The Goldstack deployment the build is performed for.
   */
  deploymentName: string;
}

export interface ServerBuildOptionsArgs {
  /**
   * Called when CSS is generate for a React component
   */
  onCSSGenerated: (css: string) => void;
  /**
   * The Goldstack deployment the build is performed for.
   */
  deploymentName: string;
}

export const getOutDirForLambda = (
  packageRootDir: string,
  config: LambdaConfig
): string => {
  if (config.path === '$default') {
    return path.join(packageRootDir, `distLambda/${config.path}`);
  }
  if (config.path.endsWith('/')) {
    return path.join(packageRootDir, `distLambda${config.path}index`);
  }
  return `./distLambda${config.path}`;
};

export const getOutFileForLambda = (
  packageRootDir: string,
  config: LambdaConfig
): string => {
  return `${getOutDirForLambda(packageRootDir, config)}/lambda.js`;
};

export const buildFunctions = async ({
  routesDir,
  configs,
  deploymentName,
  buildOptions,
  lambdaNamePrefix,
  routeFilter,
  packageRootDir,
}: {
  routesDir: string;
  configs: LambdaConfig[];
  deploymentName: string;
  buildOptions: (args: ServerBuildOptionsArgs) => BuildOptions;
  lambdaNamePrefix: string;
  routeFilter?: string;
  packageRootDir: string;
}): Promise<void> => {
  const buildConfig = readToType<BuildOptions>('./esbuild.config.json');

  // if we have a filter, we don't remove previous outputs
  if (!routeFilter) {
    await rmSafe(path.join(packageRootDir, 'distLambda'));
    mkdir('-p', path.join(packageRootDir, 'distLambda/zips'));
  }
  for await (const config of configs) {
    mkdir('-p', getOutDirForLambda(packageRootDir, config));
    const esbuildLocalPath = changeExtension(
      `${routesDir}/${config.relativeFilePath}`,
      '.esbuild.config.json'
    );
    const functionName = generateFunctionName(lambdaNamePrefix, config);
    const localBuildConfig = readToType<BuildOptions>(esbuildLocalPath);

    const onCSSGenerated = (css: string): void => {
      generatedCss.push(css);
    };
    const generatedCss: string[] = [];
    const res = await build({
      ...buildOptions({ onCSSGenerated, deploymentName }),
      entryPoints: [`${routesDir}/${config.relativeFilePath}`],
      outfile: getOutFileForLambda(packageRootDir, config),
      ...buildConfig,
      ...localBuildConfig,
    });
    if (res.metafile) {
      write(
        JSON.stringify(res.metafile),
        path.join(packageRootDir, `distLambda/zips/${functionName}.meta.json`)
      );
    }
    // provide CSS for initial load
    write(
      generatedCss.join('\n'),
      `${getOutDirForLambda(packageRootDir, config)}/client.bundle.css`
    );
  }
};
