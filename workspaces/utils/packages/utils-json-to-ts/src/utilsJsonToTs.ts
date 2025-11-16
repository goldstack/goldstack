import { globSync, mkdir, read, write } from '@goldstack/utils-sh';
import fs from 'fs';
import { compileFromFile, type Options } from 'json-schema-to-typescript';
import path from 'path';
import replaceExt from 'replace-ext';

const processSchema = async (
  jsonSource: string,
  dest: string,
  options: Partial<Options>,
): Promise<void> => {
  let bannerComment: string | undefined;
  const tsHeader = replaceExt(jsonSource, '.head.ts');
  if (fs.existsSync(tsHeader)) {
    bannerComment = read(tsHeader);
  }
  const res = await compileFromFile(jsonSource, {
    style: {
      bracketSpacing: true,
      printWidth: 120,
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
      useTabs: false,
    },
    bannerComment,
    ...options,
  });

  const newName = path.parse(path.basename(jsonSource)).name;
  mkdir('-p', dest);
  write(res, dest + newName + '.ts');
};

export const run = async (args: string[]): Promise<void> => {
  const files = globSync('./src/schemas/*.json');
  const declareExternallyReferenced =
    args.length >= 3 && args[2] === '--declareExternallyReferenced';
  files.forEach(async (file) => {
    await processSchema(file, './src/generated/', {
      declareExternallyReferenced,
    });
    console.log('Processed: ' + file);
  });
};
