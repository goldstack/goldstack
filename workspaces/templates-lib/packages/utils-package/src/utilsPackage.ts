import { parseConfig, validateConfig } from '@goldstack/utils-config';
import configSchema from './schemas/configSchema.json';
import { read, write } from '@goldstack/utils-sh';
import type { Package } from './types/packageTypes';
import pathLib from 'path';

import type { Argv } from 'yargs';
import { assert } from 'console';

export type {
  Package,
  PackageConfiguration as Configuration,
  Name,
} from './types/packageTypes';

export const getPackageConfigSchema = (): object => {
  return configSchema;
};

export const writePackageConfig = (packageConfig: Package, packagePath = './'): void => {
  const schemaPath = packagePath + 'schemas/package.schema.json';
  validateConfig(packageConfig, JSON.parse(read(schemaPath)), {
    errorMessage: 'Cannot write package config since it is not valid.',
  });
  write(JSON.stringify(packageConfig, null, 2), packagePath + 'goldstack.json');
};

export const readPackageConfig = (packagePath = './'): Package => {
  const schemaPath = packagePath + 'schemas/package.schema.json';
  const config = parseConfig(read(packagePath + 'goldstack.json'), JSON.parse(read(schemaPath)), {
    errorMessage: 'Cannot load package configuration from ' + pathLib.resolve(packagePath),
  }) as Package;
  return config;
};

export const readPackageConfigFromDir = (dir: string): Package => {
  assert(dir.endsWith('/'));
  return readPackageConfig(dir);
};

interface BuildCliParams {
  yargs: Argv<any>;
  infraCommands: (yargs: Argv<any>) => void;
  deployCommands: (yargs: Argv<any>) => void;
}

export const buildCli = (params: BuildCliParams): Argv<any> => {
  return params.yargs
    .scriptName('template')
    .usage('$0 <infra|deploy>')
    .command(
      'infra <up|down|init|plan|apply|destroy|upgrade|terraform> <deployment>',
      'Manage infrastructure for deployment',
      params.infraCommands,
    )
    .command('deploy <deployment>', 'Deploy to specified deployment', params.deployCommands);
};

export const buildDeployCommands = () => {
  return (yargs: Argv<any>): Argv<any> => {
    return yargs.positional('deployment', {
      description: 'Name of the deployment where the package should be deployed to.',
      type: 'string',
      demandOption: true,
    });
  };
};
