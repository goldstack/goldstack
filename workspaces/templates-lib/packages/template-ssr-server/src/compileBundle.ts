import { build, BuildOptions } from 'esbuild';
import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp';

import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { changeExtension, readToType } from '@goldstack/utils-sh';
import { dirname } from 'path';

import cssModulesPlugin from 'esbuild-css-modules-plugin';

const sharedConfig: BuildOptions = {
  plugins: [
    pnpPlugin(),
    cssModulesPlugin({
      generateScopedName: '[path][local]-[hash:base64:10]',
    }),
  ],
  bundle: true,
  outdir: './dist/tmp',
  external: [
    'esbuild',
    '@yarnpkg/esbuild-plugin-pnp',
    '@goldstack/template-ssr-server', // this is only required on the server side
  ],
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

export interface CompileBundleResponse {
  bundle: string;
  sourceMap?: string;
  metaFile?: string;
}

export const compileBundle = async ({
  entryPoint,
  metaFile,
  sourceMap,
  initialProperties,
}: {
  entryPoint: string;
  metaFile?: boolean;
  sourceMap?: boolean;
  initialProperties?: any;
}): Promise<CompileBundleResponse> => {
  const res = await build({
    ...sharedConfig,
    entryPoints: [entryPoint],
    metafile: metaFile,
    sourcemap: sourceMap ? 'inline' : undefined,
    ...getEsBuildConfig(entryPoint),
    write: false,
  });

  const output = Buffer.from(res.outputFiles[0].contents).toString('utf-8');
  let result: CompileBundleResponse = {
    bundle: '',
  };
  if (!sourceMap) {
    result.bundle = output;
  } else {
    result.bundle = removeSourceMap(output);
  }

  if (initialProperties) {
    result.bundle = `window.initialProperties = ${JSON.stringify(
      initialProperties
    )};${result.bundle}`;
  }

  if (metaFile) {
    result = {
      ...result,
      metaFile: JSON.stringify(res.metafile),
    };
  }

  if (sourceMap) {
    result = {
      ...result,
      sourceMap: extractSourceMap(output),
    };
  }

  return result;
};

export const bundleResponse = async ({
  entryPoint,
  initialProperties,
}: {
  entryPoint: string;
  initialProperties?: any;
}): Promise<APIGatewayProxyResultV2> => {
  const res = await compileBundle({ entryPoint, initialProperties });

  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/javascript',
      SourceMap: '?resource=sourcemap',
    },
    body: res.bundle,
  };
};

const extractSourceMap = (output: string): string => {
  const marker = '//# sourceMappingURL=data:application/json;base64,';
  const startContent = output.indexOf(marker) + marker.length;
  const sourceMapBase64Data = output.substring(startContent);

  const sourceMapData = Buffer.from(sourceMapBase64Data, 'base64').toString(
    'utf-8'
  );
  return sourceMapData;
};

const removeSourceMap = (output: string): string => {
  const marker = '//# sourceMappingURL=data:application/json;base64,';
  const startContent = output.indexOf(marker);
  const withoutSourceMap = output.substring(0, startContent);

  return withoutSourceMap;
};
export const sourceMapResponse = async ({
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

  const output = Buffer.from(res.outputFiles[0].contents).toString('utf-8');
  const sourceMapData = extractSourceMap(output);

  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
    },
    body: sourceMapData,
  };
};
