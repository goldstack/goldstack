import { parseConfig } from '@goldstack/utils-config';
import { read } from '@goldstack/utils-sh';
import type { GoldstackTemplateConfiguration } from './generated/goldstackTemplateConfigurationSchema';
import configSchema from './schemas/goldstackTemplateConfigurationSchema.json';

export type { GoldstackTemplateConfiguration } from './generated/goldstackTemplateConfigurationSchema';

/**
 * Reads and parses a template configuration from a string.
 *
 * @param data - The JSON string containing the template configuration.
 * @returns The parsed GoldstackTemplateConfiguration object.
 */
export const readTemplateConfigFromString = (data: string): GoldstackTemplateConfiguration => {
  const config = parseConfig(data, configSchema, {
    errorMessage: 'Cannot load template config.',
  }) as GoldstackTemplateConfiguration;
  return config;
};

/**
 * Reads and parses a template configuration from a file.
 *
 * @param path - The path to the template.json file. Defaults to 'template.json'.
 * @returns The parsed GoldstackTemplateConfiguration object.
 */
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
