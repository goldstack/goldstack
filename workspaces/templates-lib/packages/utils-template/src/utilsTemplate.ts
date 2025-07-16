import { parseConfig } from '@goldstack/utils-config';
import configSchema from './schemas/goldstackTemplateConfigurationSchema.json';
import { read } from '@goldstack/utils-sh';
import type { GoldstackTemplateConfiguration } from './generated/goldstackTemplateConfigurationSchema';

export type { GoldstackTemplateConfiguration } from './generated/goldstackTemplateConfigurationSchema';

export const readTemplateConfigFromString = (data: string): GoldstackTemplateConfiguration => {
  const config = parseConfig(data, configSchema, {
    errorMessage: 'Cannot load template config.',
  }) as GoldstackTemplateConfiguration;
  return config;
};

export const readTemplateConfigFromFile = (
  path = 'template.json',
): GoldstackTemplateConfiguration => {
  try {
    const data = read(path);
    return readTemplateConfigFromString(data);
  } catch (e) {
    throw new Error(`Cannot load template config from ${path}. Error: ${e.message}`);
  }
};
