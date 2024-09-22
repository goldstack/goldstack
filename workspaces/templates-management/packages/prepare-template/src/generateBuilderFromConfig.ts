import { PrepareTemplate, PrepareTemplateParams } from './prepareTemplateTypes';
import { parseConfig } from '@goldstack/utils-config';
import {
  read,
  write,
  mkdir,
  copy,
  rmSafe,
  globSync,
} from '@goldstack/utils-sh';
import { readPackageConfig } from '@goldstack/utils-package';
import { readTemplateConfigFromFile } from '@goldstack/utils-template';
import {
  TemplateBuildConfiguration,
  FileOverwriteConfiguration,
} from './types/templateBuildSchema';
import configSchema from './schemas/configSchema.json';
import fs from 'fs';
import jsonpath from 'jsonpath';
import { debug, info, warn } from '@goldstack/utils-log';
import path from 'path';

const readBuildConfigFromString = (
  data: string
): TemplateBuildConfiguration => {
  const config = parseConfig(data, configSchema, {
    errorMessage: 'Cannot load template config.',
  }) as TemplateBuildConfiguration;
  return config;
};

const readBuildConfigFromFile = (
  path = 'build.json'
): TemplateBuildConfiguration => {
  const data = read(path);
  return readBuildConfigFromString(data);
};

const overwriteFieldsInFile = async (
  params: PrepareTemplateParams,
  overwriteFile: FileOverwriteConfiguration
): Promise<void> => {
  const filePath = params.destinationDirectory + overwriteFile.file;

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Invalid file path in build config for field overwrite. Cannot find ${filePath}.`
    );
  }

  let data = JSON.parse(read(filePath));

  for (const field of overwriteFile.fields) {
    if (field.path === '$') {
      data = field.value;
    } else {
      jsonpath.apply(data, field.path, () => {
        return field.value;
      });
    }
  }

  write(JSON.stringify(data, null, 2), filePath);
};

const overwriteFields = async (
  params: PrepareTemplateParams,
  overwriteFiles: FileOverwriteConfiguration[]
): Promise<void> => {
  for (const overwriteFile of overwriteFiles) {
    await overwriteFieldsInFile(params, overwriteFile);
  }
};

export const generateBuilderFromConfig = async (
  templateDirectory: string
): Promise<PrepareTemplate | undefined> => {
  const buildConfig = readBuildConfigFromFile(templateDirectory + 'build.json');
  const templateConfig = readTemplateConfigFromFile(
    templateDirectory + 'template.json'
  );

  class GeneratedBuilderConfig implements PrepareTemplate {
    templateName(): string {
      return templateConfig.templateName;
    }
    async run(params: PrepareTemplateParams): Promise<void> {
      info(
        'Building template by copying files matching pattern defined in build.json to ' +
          params.destinationDirectory
      );
      // just copy all files and then delete ignored files
      for (const glob of buildConfig.include) {
        debug('Looking for files matching ' + glob);
        const lastSlashIdx = glob.lastIndexOf('/');
        let dirComponent = '';
        if (lastSlashIdx !== -1) {
          dirComponent = glob.slice(0, lastSlashIdx) + '/';
        }
        const dest = path.join(params.destinationDirectory, dirComponent);
        mkdir('-p', dest);

        const source = path.join(templateDirectory, glob);

        debug('Perform copy ' + source + ' to ' + dest);
        await copy(source, dest);
      }

      // Delete files matching the exclude patterns
      for (const glob of buildConfig.exclude) {
        debug('Looking for files to delete matching ' + glob);
        const filesToDelete = globSync(
          path.join(params.destinationDirectory, glob).replace(/\\/g, '/')
        );
        if (filesToDelete.length === 0) {
          warn('No files will be deleted since no files matched glob ' + glob);
          continue;
        }
        await rmSafe(...filesToDelete);
      }

      // assign overwritten fields
      if (buildConfig.overwriteFiles) {
        await overwriteFields(params, buildConfig.overwriteFiles);
      }

      const packageConfig = readPackageConfig(params.destinationDirectory);
      packageConfig.template = templateConfig.templateName;
      packageConfig.name = '';
      packageConfig.templateVersion = '0.0.0';
      write(
        JSON.stringify(packageConfig, null, 2),
        params.destinationDirectory + 'goldstack.json'
      );

      // cleaning up packageJson
      const packageJson = JSON.parse(
        read(params.destinationDirectory + 'package.json')
      );
      packageJson.name = '';
      packageJson.author = '';
      packageJson.license = '';
      packageJson['private'] = undefined;
      write(
        JSON.stringify(packageJson, null, 2),
        params.destinationDirectory + 'package.json'
      );
    }
  }

  return new GeneratedBuilderConfig();
};
