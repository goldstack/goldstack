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

export const getOutDirForLambda = (config: LambdaConfig): string => {
  if (config.path === '$default') {
    return `./distLambda/${config.path}`;
  }
  if (config.path.endsWith('/')) {
    return `./distLambda${config.path}index`;
  }
  return `./distLambda${config.path}`;
};

export const getOutFileForLambda = (config: LambdaConfig): string => {
  return `${getOutDirForLambda(config)}/lambda.js`;
};

export const buildFunctions = async ({
  routesDir,
  configs,
  deploymentName,
  buildOptions,
  lambdaNamePrefix,
  routeFilter,
}: {
  routesDir: string;
  configs: LambdaConfig[];
  deploymentName: string;
  buildOptions: (args: ServerBuildOptionsArgs) => BuildOptions;
  lambdaNamePrefix: string;
  routeFilter?: string;
}): Promise<void> => {
  const buildConfig = readToType<BuildOptions>('./esbuild.config.json');

  // if we have a filter, we don't remove previous outputs
  if (!routeFilter) {
    await rmSafe('./distLambda');
    mkdir('-p', './distLambda/zips');
  }
  for await (const config of configs) {
    mkdir('-p', getOutDirForLambda(config));
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
      outfile: getOutFileForLambda(config),
      ...buildConfig,
      ...localBuildConfig,
    });
    if (res.metafile) {
      write(
        JSON.stringify(res.metafile),
        `./distLambda/zips/${functionName}.meta.json`
      );
    }
    // provide CSS for initial load
    write(
      generatedCss.join('\n'),
      `${getOutDirForLambda(config)}/client.bundle.css`
    );
  }
};
