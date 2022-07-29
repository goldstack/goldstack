import { build, BuildOptions } from 'esbuild';
import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp';
import cssServerPlugin from 'esbuild-css-modules-server-plugin';
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

    const generatedCss: string[] = [];
    const res = await build({
      plugins: [
        cssServerPlugin({
          onCSSGenerated: (css) => {
            generatedCss.push(css);
          },
        }),
        pnpPlugin(),
      ],
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
      define: {
        'process.env.NODE_ENV': '"production"',
      }, // see https://github.com/evanw/esbuild/issues/2377
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
    // provide CSS for initial load
    write(
      generatedCss.join('\n'),
      `${getOutDirForLambda(config)}/client.bundle.css`
    );
  }
};
