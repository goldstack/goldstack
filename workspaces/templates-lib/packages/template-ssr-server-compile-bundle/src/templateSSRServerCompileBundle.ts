import { build } from 'esbuild';
import type { BuildOptions, BuildResult, OutputFile } from 'esbuild';

import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { changeExtension, readToType } from '@goldstack/utils-sh';
import { dirname } from 'path';

export interface ESBuildConfiguration {
  createClientBuildOptions: (includeCss: boolean) => BuildOptions;
  createServerBuildOptions: (
    onCSSGenerated: (css: string) => void
  ) => BuildOptions;
}

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
  esbuildConfig,
}: {
  entryPoint: string;
  metaFile?: boolean;
  sourceMap?: boolean;
  initialProperties?: any;
  includeCss: boolean;
  esbuildConfig: ESBuildConfiguration;
}): Promise<CompileBundleResponse> => {
  const res = await build({
    ...esbuildConfig.createClientBuildOptions(includeCss),
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
  esbuildConfig,
}: {
  entryPoint: string;
  initialProperties?: any;
  esbuildConfig: ESBuildConfiguration;
}): Promise<APIGatewayProxyResultV2> => {
  const res = await compileBundle({
    entryPoint,
    initialProperties,
    includeCss: true,
    esbuildConfig,
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
  esbuildConfig,
}: {
  entryPoint: string;
  esbuildConfig: ESBuildConfiguration;
}): Promise<APIGatewayProxyResultV2> => {
  const res = await build({
    ...esbuildConfig.createClientBuildOptions(false),
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
