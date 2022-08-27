import { build } from 'esbuild';
import type { BuildOptions } from 'esbuild';
import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp';
import cssPlugin from 'esbuild-css-modules-client-plugin';
import { LambdaConfig } from './types/LambdaConfig';
import { generateFunctionName } from './generate/generateFunctionName';
import {
  changeExtension,
  mkdir,
  readToType,
  rmSafe,
  write,
} from '@goldstack/utils-sh';

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
  buildOptions,
  lambdaNamePrefix,
}: {
  routesDir: string;
  configs: LambdaConfig[];
  buildOptions: (args: {
    onCSSGenerated: (css: string) => void;
  }) => BuildOptions;
  lambdaNamePrefix?: string;
}): Promise<void> => {
  const buildConfig = readToType<BuildOptions>('./esbuild.config.json');

  await rmSafe('./distLambda');
  mkdir('-p', './distLambda/zips');
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
      ...buildOptions({ onCSSGenerated }),
      entryPoints: [`${routesDir}/${config.relativeFilePath}`],
      outfile: getOutFileForLambda(config),
      ...buildConfig,
      ...localBuildConfig,
    });
    if (!res.metafile) {
      throw new Error(`Metafile for ${functionName} not defined.`);
    }
    write(
      JSON.stringify(res.metafile),
      `./distLambda/zips/${functionName}.meta.json`
    );
    // provide CSS for initial load
    write(
      generatedCss.join('\n'),
      `${getOutDirForLambda(config)}/client.bundle.css`
    );
  }
};
