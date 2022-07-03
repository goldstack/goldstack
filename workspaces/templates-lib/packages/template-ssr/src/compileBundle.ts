import { build, BuildOptions } from 'esbuild';
import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp';

import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { changeExtension, readToType } from '@goldstack/utils-sh';
import { dirname } from 'path';

const sharedConfig: BuildOptions = {
  plugins: [pnpPlugin()],
  bundle: true,
  external: ['esbuild', '@yarnpkg/esbuild-plugin-pnp'],
  minify: true,
  platform: 'browser',
  format: 'iife',
  treeShaking: true,
};

const getEsBuildConfig = (entryPoint: string): BuildOptions => {
  const esbuildConfig = readToType<BuildOptions>('./esbuild.config.json');
  const esbuildLocalPath = changeExtension(
    dirname(entryPoint),
    '.esbuild.config.json'
  );
  const localEsbuildConfig = readToType<BuildOptions>(esbuildLocalPath);
  return { ...esbuildConfig, ...localEsbuildConfig };
};

export const compileBundle = async (
  entryPoint: string
): Promise<APIGatewayProxyResultV2> => {
  const res = await build({
    ...sharedConfig,
    entryPoints: [entryPoint],
    // metafile: true,
    ...getEsBuildConfig(entryPoint),
    write: false,
  });
  // if (!res.metafile) {
  //   throw new Error(`Metafile for ${entryPoint} not defined.`);
  // }
  // write(
  //   JSON.stringify(res.metafile),
  //   `./distLambda/zips/${functionName}.meta.json`
  // );

  // for (const out of res.outputFiles) {
  //   console.log(out.path, out.contents);
  // }

  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/javascript',
      SourceMap: '?resource=sourcemap',
    },
    body: Buffer.from(res.outputFiles[0].contents).toString('utf-8'),
  };
};

export const compileSourceMap = async ({
  entryPoint,
}: {
  entryPoint: string;
}): Promise<APIGatewayProxyResultV2> => {
  const res = await build({
    ...sharedConfig,
    entryPoints: [entryPoint],
    sourcemap: 'inline',
    ...getEsBuildConfig(entryPoint),
    write: false,
  });

  const marker = '//# sourceMappingURL=data:application/json;base64,';

  const output = Buffer.from(res.outputFiles[0].contents).toString('utf-8');

  const startContent = output.indexOf(marker) + marker.length;

  const sourceMapBase64Data = output.substring(startContent);

  const sourceMapData = Buffer.from(sourceMapBase64Data, 'base64').toString(
    'utf-8'
  );

  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
    },
    body: sourceMapData,
  };
};
