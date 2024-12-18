import { S3TemplateRepository } from '@goldstack/template-repository';
import extract from 'extract-zip';
import { rm, mkdir, write, read } from '@goldstack/utils-sh';
import { AssertionError } from 'assert';
import { debug } from '@goldstack/utils-log';
import path from 'path';
import {
  ProjectConfiguration,
  PackageProjectConfiguration,
} from '@goldstack/utils-project';

import { readPackageConfig } from '@goldstack/utils-package';

export interface TemplateReference {
  name: string;
  version?: string;
}

export interface ProjectBuildParams {
  s3: S3TemplateRepository;
  config: ProjectConfiguration;
  destinationDirectory: string;
}

const assertTemplateReferenceVersion = async (
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
function assert(condition: any, msg?: string): asserts condition {
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

const setPackageName = (packageFolder: string, packageName: string): void => {
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

const buildTemplate = async (
  params: ProjectBuildParams,
  packageConfig: PackageProjectConfiguration
): Promise<void> => {
  debug(
    `Building package ${packageConfig.packageName} in ${params.destinationDirectory}`
  );
  const template: TemplateReference = {
    name: packageConfig.templateReference.templateName,
    version: packageConfig.templateReference.templateVersion,
  };

  const templateReference = await assertTemplateReferenceVersion(
    params.s3,
    template
  );

  assert(templateReference.version);

  const packageFolder = path.join(
    params.destinationDirectory,
    'packages',
    `${packageConfig.packageName}/`
  );

  mkdir('-p', packageFolder);
  const zipPath = await params.s3.downloadTemplateArchive(
    templateReference.name,
    templateReference.version,
    packageFolder
  );

  assert(zipPath);
  await extract(zipPath, { dir: path.resolve(packageFolder) });

  rm('-f', zipPath);
  debug('Template archive extracted to ' + path.resolve(packageFolder));
  setPackageName(packageFolder, packageConfig.packageName);
};

export const buildProject = async (
  params: ProjectBuildParams
): Promise<void> => {
  debug(
    `Building project ${params.config.projectName} to ${params.destinationDirectory}`
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
    params.destinationDirectory
  );
  assert(zipPath);

  debug(`Extracting zip archive ${zipPath}`);
  await extract(zipPath, { dir: path.resolve(params.destinationDirectory) });
  debug(`Zip file extracted ${zipPath}.`);
  rm('-f', zipPath);

  // Set package name
  setPackageName(params.destinationDirectory, params.config.projectName);

  // building packages
  for (const packageConfig of config.packages) {
    await buildTemplate(params, packageConfig);
  }
};
