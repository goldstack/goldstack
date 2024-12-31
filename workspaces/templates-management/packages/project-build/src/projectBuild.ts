import { S3TemplateRepository } from '@goldstack/template-repository';
import extract from 'extract-zip';
import { rm, write, read } from '@goldstack/utils-sh';
import { AssertionError } from 'assert';
import { debug } from '@goldstack/utils-log';
import path, { resolve } from 'path';
import { ProjectConfiguration } from '@goldstack/utils-project';

import { readPackageConfig } from '@goldstack/utils-package';
import { readdirSync } from 'fs';
import { buildTemplate } from './buildTemplate';

export interface TemplateReference {
  name: string;
  version?: string;
}

export interface ProjectBuildParams {
  s3: S3TemplateRepository;
  config: ProjectConfiguration;
  projectDirector: string;
}

export const assertTemplateReferenceVersion = async (
  s3: S3TemplateRepository,
  templateReference: TemplateReference
): Promise<TemplateReference> => {
  if (templateReference.version) {
    return templateReference;
  }

  const config = await s3.getLatestTemplateVersion(templateReference.name);

  if (!config) {
    throw new Error(
      'Cannot load latest template version for ' + templateReference.name
    );
  }

  return {
    name: config.templateName,
    version: config.templateVersion,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new AssertionError({ message: msg });
  }
}

function sortKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortKeys); // Recursively sort array elements
  } else if (obj && typeof obj === 'object') {
    return Object.keys(obj)
      .sort() // Sort the keys
      .reduce((sortedObj, key) => {
        sortedObj[key] = sortKeys(obj[key]); // Recursively sort sub-objects
        return sortedObj;
      }, {} as Record<string, any>);
  }
  return obj; // Return the value if it's not an object or array
}

export const setPackageName = (
  packageFolder: string,
  packageName: string
): void => {
  const goldstackPackageConfig = readPackageConfig(packageFolder);
  goldstackPackageConfig.name = packageName;
  write(
    JSON.stringify(goldstackPackageConfig, null, 2),
    path.join(packageFolder, 'goldstack.json')
  );

  const packageJson = JSON.parse(
    read(path.join(packageFolder, 'package.json'))
  );
  packageJson.name = packageName;
  write(
    JSON.stringify(sortKeys(packageJson), null, 2),
    path.join(packageFolder, 'package.json')
  );
};

export const buildProject = async (
  params: ProjectBuildParams
): Promise<void> => {
  debug(
    `Building project ${params.config.projectName} into ${params.projectDirector}`
  );
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
    params.projectDirector
  );
  assert(zipPath);

  debug(`Extracting zip archive ${zipPath}`, {
    zipPath,
    destinationDirectory: resolve(params.projectDirector),
    filesInDestinationDirBeforeUnzip: readdirSync(
      resolve(params.projectDirector)
    ).join(', '),
  });
  await extract(zipPath, { dir: path.resolve(params.projectDirector) });
  debug(`Zip file extracted ${zipPath}.`, {
    zipPath,
    destinationDirectory: resolve(params.projectDirector),
    filesInDestinationDirAfterUnzip: readdirSync(
      resolve(params.projectDirector)
    ).join(', '),
  });
  rm('-f', zipPath);

  // Set package name
  setPackageName(params.projectDirector, params.config.projectName);

  // building packages
  for (const packageConfig of config.packages) {
    await buildTemplate(params, packageConfig);
  }
};
