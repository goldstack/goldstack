import { build, BuildOptions } from 'esbuild';
import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp';

import { APIGatewayProxyResultV2 } from 'aws-lambda';

export const compileBundle = async (
  entryPoint: string
): Promise<APIGatewayProxyResultV2> => {
  const res = await build({
    plugins: [pnpPlugin()],
    bundle: true,
    entryPoints: [entryPoint],
    external: ['esbuild', '@yarnpkg/esbuild-plugin-pnp'],
    minify: true,
    platform: 'browser',
    format: 'iife',
    write: false,
    treeShaking: true,
    sourcemap: 'inline',
    // metafile: true,
    // ...esbuildConfig,
    // ...localEsbuildConfig,
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
    },
    body: Buffer.from(res.outputFiles[0].contents).toString('utf-8'),
  };
};
