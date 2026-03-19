import { parseConfig } from '@goldstack/utils-config';
import { read } from '@goldstack/utils-sh';
import configSchema from './schemas/configSchema.json';
import type { ProjectConfiguration } from './types/projectConfigurationSchema';

export * from './types/projectConfigurationSchema';

export const readProjectConfigFromString = (data: string): ProjectConfiguration => {
  const config = parseConfig(data, configSchema, {
    errorMessage: 'Cannot load template config.',
  }) as ProjectConfiguration;
  return config;
};

export const readProjectConfigFromFile = (path = 'project.json'): ProjectConfiguration => {
  const data = read(path);
  return readProjectConfigFromString(data);
};
