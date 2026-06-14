import type { S3TemplateRepository } from '@goldstack/template-repository';
import { debug } from '@goldstack/utils-log';
import { readPackageConfig } from '@goldstack/utils-package';
import type { ProjectConfiguration } from '@goldstack/utils-project';
import { read, rm, write } from '@goldstack/utils-sh';
import { AssertionError } from 'assert';
import { createWriteStream, promises as fsPromises, statSync } from 'fs';
import path, { resolve } from 'path';
import sortPackageJson from 'sort-package-json';
import yauzl from 'yauzl';
import { buildTemplate } from './buildTemplate';

const EXTRACT_TIMEOUT_MS = 120000;

interface ExtractResult {
  success: boolean;
  error?: Error;
}

/**
 * Extracts a zip archive from a file path into a target directory using yauzl.fromBuffer
 * to avoid fd-slicer ref-count leak issues with yauzl.open().
 */
function extractZipFromPath(zipPath: string, dir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    void (async () => {
      let canceled = false;
      try {
        const buffer = await fsPromises.readFile(zipPath);
        const zipfile = await new Promise<yauzl.ZipFile>((res, rej) => {
          yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zf) => {
            if (err) return rej(err);
            res(zf!);
          });
        });

        zipfile.on('error', (e: Error) => {
          canceled = true;
          reject(e);
        });

        zipfile.on('close', () => {
          if (!canceled) resolve();
        });

        zipfile.on('entry', (entry: yauzl.Entry) => {
          if (canceled) return;

          void (async () => {
            try {
              if (entry.fileName.startsWith('__MACOSX/')) {
                zipfile.readEntry();
                return;
              }

              const dest = path.join(dir, entry.fileName);

              if (/\/$/.test(entry.fileName)) {
                await fsPromises.mkdir(dest, { recursive: true });
                zipfile.readEntry();
                return;
              }

              await fsPromises.mkdir(path.dirname(dest), { recursive: true });

              const readStream = await new Promise<NodeJS.ReadableStream>((res, rej) => {
                zipfile.openReadStream(entry, (err, rs) => {
                  if (err) return rej(err);
                  // biome-ignore lint/style/noNonNullAssertion: rs is never undefined when err is null
                  res(rs!);
                });
              });

              const writeStream = createWriteStream(dest);
              await new Promise<void>((res, rej) => {
                readStream.on('error', rej);
                writeStream.on('error', rej);
                writeStream.on('finish', res);
                readStream.pipe(writeStream);
              });
              zipfile.readEntry();
            } catch (e) {
              canceled = true;
              reject(e);
            }
          })();
        });

        zipfile.readEntry();
      } catch (e) {
        reject(e);
      }
    })();
  });
}

export function extractWithTimeout(zipPath: string, dir: string): Promise<ExtractResult> {
  const stats = statSync(zipPath);
  debug(`Pre-extract file stats: exists=true, size=${stats.size} bytes, zipPath=${zipPath}`);

  return Promise.race<ExtractResult>([
    extractZipFromPath(zipPath, dir).then(() => ({ success: true })),
    new Promise<ExtractResult>((resolve) => {
      setTimeout(() => {
        resolve({
          success: false,
          error: new Error(
            `Extraction timed out after ${EXTRACT_TIMEOUT_MS / 1000}s for ${zipPath} (${stats.size} bytes)`,
          ),
        });
      }, EXTRACT_TIMEOUT_MS);
    }),
  ]);
}

export interface TemplateReference {
  name: string;
  version?: string;
}

export interface ProjectBuildParams {
  s3: S3TemplateRepository;
  config: ProjectConfiguration;
  projectDirectory: string;
}

export const assertTemplateReferenceVersion = async (
  s3: S3TemplateRepository,
  templateReference: TemplateReference,
): Promise<TemplateReference> => {
  if (templateReference.version) {
    return templateReference;
  }

  const config = await s3.getLatestTemplateVersion(templateReference.name);

  if (!config) {
    throw new Error(`Cannot load latest template version for ${templateReference.name}`);
  }

  return {
    name: config.templateName,
    version: config.templateVersion,
  };
};

// biome-ignore lint/suspicious/noExplicitAny: Assertion function accepts any condition
export function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new AssertionError({ message: msg });
  }
}

// biome-ignore lint/suspicious/noExplicitAny: Generic utility function for sorting package.json
function sortKeys(obj: any): any {
  return sortPackageJson(obj);
}

export const setPackageName = (packageFolder: string, packageName: string): void => {
  const goldstackPackageConfig = readPackageConfig(packageFolder);
  goldstackPackageConfig.name = packageName;
  write(
    JSON.stringify(goldstackPackageConfig, null, 2),
    path.join(packageFolder, 'goldstack.json'),
  );

  const packageJson = JSON.parse(read(path.join(packageFolder, 'package.json')));
  packageJson.name = packageName;
  write(JSON.stringify(sortKeys(packageJson), null, 2), path.join(packageFolder, 'package.json'));
};

export const buildProject = async (params: ProjectBuildParams): Promise<void> => {
  debug(`Building project ${params.config.projectName} into ${params.projectDirectory}`);
  const config = params.config;

  // building workspaces project
  const rootReference = await assertTemplateReferenceVersion(params.s3, {
    name: config.rootTemplateReference.templateName,
    version: config.rootTemplateReference.templateVersion,
  });

  assert(rootReference.version);

  const zipPath = await params.s3.downloadTemplateArchive(
    rootReference.name,
    rootReference.version,
    params.projectDirectory,
  );
  assert(zipPath);

  debug(`Extracting zip archive ${zipPath}`, {
    zipPath,
    destinationDirectory: resolve(params.projectDirectory),
  });
  const extractResult = await extractWithTimeout(zipPath, path.resolve(params.projectDirectory));
  if (!extractResult.success) {
    throw extractResult.error || new Error('Extraction failed for unknown reason');
  }
  debug(`Zip file extracted ${zipPath}.`, {
    zipPath,
    destinationDirectory: resolve(params.projectDirectory),
  });
  rm('-f', zipPath);

  // Set package name
  setPackageName(params.projectDirectory, params.config.projectName);

  // building packages
  for (const packageConfig of config.packages) {
    await buildTemplate(params, packageConfig);
  }
};
