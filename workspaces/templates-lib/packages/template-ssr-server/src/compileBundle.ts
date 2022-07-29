import { build, BuildOptions, BuildResult, OutputFile } from 'esbuild';
import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp';

import cssPlugin from 'esbuild-css-modules-client-plugin';

import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { changeExtension, readToType } from '@goldstack/utils-sh';
import { dirname } from 'path';

const sharedConfig = (includeCss: boolean): BuildOptions => {
  return {
    plugins: [
      cssPlugin({
        excludeCSSInject: !includeCss,
      }),
      pnpPlugin(),
    ],
    bundle: true,
    outfile: '/dist/tmp/bundle.js', // this is used for nothing, but if not supplying it css modules plugin fails
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

const getOutput = (
  extension: string,
  result: BuildResult & {
    outputFiles: OutputFile[];
  }
): string => {
  const matchedFiles = result.outputFiles.filter((file) =>
    file.path.endsWith(extension)
  );

  if (matchedFiles.length !== 1) {
    throw new Error(
      `Invalid output from esbuild. Expected only one '${extension}' file but found ${matchedFiles.length}`
    );
  }

  const output = Buffer.from(matchedFiles[0].contents).toString('utf-8');
  return output;
};

export const compileBundle = async ({
  entryPoint,
  metaFile,
  sourceMap,
  initialProperties,
  includeCss,
}: {
  entryPoint: string;
  metaFile?: boolean;
  sourceMap?: boolean;
  initialProperties?: any;
  includeCss: boolean;
}): Promise<CompileBundleResponse> => {
  const res = await build({
    ...sharedConfig(includeCss),
    entryPoints: [entryPoint],
    metafile: metaFile,
    sourcemap: sourceMap ? 'inline' : undefined,
    ...getEsBuildConfig(entryPoint),
    write: false,
  });

  const output = getOutput('.js', res);
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
  const res = await compileBundle({
    entryPoint,
    initialProperties,
    includeCss: true,
  });

  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expire: '0',
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
    ...sharedConfig(false),
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
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expire: '0',
    },
    body: sourceMapData,
  };
};
