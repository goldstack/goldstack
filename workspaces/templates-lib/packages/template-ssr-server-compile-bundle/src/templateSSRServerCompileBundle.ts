import { build } from 'esbuild';
import type { BuildOptions, BuildResult, OutputFile } from 'esbuild';

import type { APIGatewayProxyResultV2 } from 'aws-lambda';
import { changeExtension, readToType } from '@goldstack/utils-sh';
import { dirname } from 'path';

import type { StaticFileMapperManager } from 'static-file-mapper-build';

import type {
  ClientBuildOptionsArgs,
  ServerBuildOptionsArgs,
} from '@goldstack/utils-aws-lambda';
import { debug } from '@goldstack/utils-log';

export type {
  ClientBuildOptionsArgs,
  ServerBuildOptionsArgs,
} from '@goldstack/utils-aws-lambda';

export interface BuildConfiguration {
  staticFileMapper: StaticFileMapperManager;
  createClientBuildOptions: (args: ClientBuildOptionsArgs) => BuildOptions;
  createServerBuildOptions: (args: ServerBuildOptionsArgs) => BuildOptions;
}

const getBuildConfig = (entryPoint: string): BuildOptions => {
  const buildConfig = readToType<BuildOptions>('./esbuild.config.json');
  const esbuildLocalPath = changeExtension(
    dirname(entryPoint),
    '.esbuild.config.json'
  );
  const localBuildConfig = readToType<BuildOptions>(esbuildLocalPath);
  return { ...buildConfig, ...localBuildConfig };
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
  buildOptions,
  buildConfig,
}: {
  entryPoint: string;
  metaFile?: boolean;
  buildOptions: ClientBuildOptionsArgs;
  buildConfig: BuildConfiguration;
}): Promise<CompileBundleResponse> => {
  const clientBuildConfig = buildConfig.createClientBuildOptions(buildOptions);
  if (clientBuildConfig.sourcemap && clientBuildConfig.sourcemap !== 'inline') {
    throw new Error('Only `inline` is supported for the `sourcemap` parameter');
  }
  debug(`Compiling client bundle for ${entryPoint}`, { entryPoint });
  const res = await build({
    ...clientBuildConfig,
    entryPoints: [entryPoint],
    metafile: metaFile,
    ...getBuildConfig(entryPoint),
    write: false,
  });

  const output = getOutput('.js', res);
  let result: CompileBundleResponse = {
    bundle: '',
  };
  if (!clientBuildConfig.sourcemap) {
    result.bundle = output;
  } else {
    result.bundle = removeSourceMap(output);
  }

  if (metaFile) {
    result = {
      ...result,
      metaFile: JSON.stringify(res.metafile),
    };
  }

  if (clientBuildConfig.sourcemap) {
    result = {
      ...result,
      sourceMap: extractSourceMap(output),
    };
  }

  return result;
};

export const bundleResponse = async ({
  entryPoint,
  buildConfig,
}: {
  entryPoint: string;
  buildConfig: BuildConfiguration;
}): Promise<APIGatewayProxyResultV2> => {
  const res = await compileBundle({
    entryPoint,
    buildOptions: {
      deploymentName: 'local',
      includeCss: true,
    },
    buildConfig,
  });

  return {
    statusCode: 200,
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
  buildConfig,
}: {
  entryPoint: string;
  buildConfig: BuildConfiguration;
}): Promise<APIGatewayProxyResultV2> => {
  const res = await build({
    ...buildConfig.createClientBuildOptions({
      includeCss: false,
      deploymentName: 'local',
    }),
    entryPoints: [entryPoint],
    sourcemap: 'inline',
    ...getBuildConfig(entryPoint),
    write: false,
  });

  const output = Buffer.from(res.outputFiles[0].contents).toString('utf-8');
  const sourceMapData = extractSourceMap(output);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expire: '0',
    },
    body: sourceMapData,
  };
};
