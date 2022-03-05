import { build, BuildOptions } from 'esbuild';
import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp';
import { LambdaConfig } from '@goldstack/utils-aws-lambda';
import { mkdir, readToType } from '@goldstack/utils-sh';
import { defaultRoutesPath } from './templateLambdaConsts';

export const getOutDirForLambda = (config: LambdaConfig): string => {
  if (config.path === '$default') {
    return `./distLambda/${config.path}`;
  }
  return `./distLambda${config.path}`;
};

export const getOutFileForLambda = (config: LambdaConfig): string => {
  return `${getOutDirForLambda(config)}/lambda.js`;
};

export const buildLambdas = async (configs: LambdaConfig[]): Promise<void> => {
  const esbuildConfig = readToType<BuildOptions>('./esbuild.config.json');
  for await (const config of configs) {
    mkdir('-p', getOutDirForLambda(config));
    await build({
      plugins: [pnpPlugin()],
      bundle: true,
      entryPoints: [`${defaultRoutesPath}/${config.relativeFilePath}`],
      external: ['aws-sdk'],
      minify: true,
      format: 'cjs',
      target: 'node12.0',
      sourcemap: true,
      outfile: getOutFileForLambda(config),
      ...esbuildConfig,
    });
  }
};
