import { build, BuildOptions } from 'esbuild';
import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp';
import {
  generateFunctionName,
  LambdaConfig,
} from '@goldstack/utils-aws-lambda';
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
  return `./distLambda${config.path}`;
};

export const getOutFileForLambda = (config: LambdaConfig): string => {
  return `${getOutDirForLambda(config)}/lambda.js`;
};

export const buildLambdas = async ({
  routesDir,
  configs,
  lambdaNamePrefix,
}: {
  routesDir: string;
  configs: LambdaConfig[];
  lambdaNamePrefix?: string;
}): Promise<void> => {
  const esbuildConfig = readToType<BuildOptions>('./esbuild.config.json');

  await rmSafe('./distLambda');
  mkdir('-p', './distLambda/zips');
  for await (const config of configs) {
    mkdir('-p', getOutDirForLambda(config));
    const esbuildLocalPath = changeExtension(
      `${routesDir}/${config.relativeFilePath}`,
      '.esbuild.config.json'
    );
    const functionName = generateFunctionName(lambdaNamePrefix, config);
    const localEsbuildConfig = readToType<BuildOptions>(esbuildLocalPath);

    const res = await build({
      plugins: [pnpPlugin()],
      bundle: true,
      entryPoints: [`${routesDir}/${config.relativeFilePath}`],
      external: [
        'aws-sdk', // included in Lambda runtime environment
      ],
      minify: true,
      platform: 'node',
      format: 'cjs',
      target: 'node16.0',
      treeShaking: true,
      sourcemap: true,
      outfile: getOutFileForLambda(config),
      metafile: true,
      ...esbuildConfig,
      ...localEsbuildConfig,
    });
    if (!res.metafile) {
      throw new Error(`Metafile for ${functionName} not defined.`);
    }
    write(
      JSON.stringify(res.metafile),
      `./distLambda/zips/${functionName}.meta.json`
    );
  }
};
