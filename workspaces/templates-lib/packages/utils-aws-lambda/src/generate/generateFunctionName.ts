import type { LambdaConfig } from './../types/LambdaConfig';
import crypto from 'crypto';

const INDEX_MARKER = '__index';
const DEFAULT_MARKER = '__default';

const sanitiseFunctionName = (input: string): string =>
  input
    .replace(/\//g, '-')
    .replace(/\$/g, '_')
    .replace(/\{/g, '_')
    .replace(/\}/g, '_')
    .replace(/\+/g, '_')
    .replace(/[^\w\-_]/gi, '_');

/**
 * Generates a valid function name for a route
 */
export const generateFunctionName = (
  prefix: string | undefined,
  config: LambdaConfig
): string => {
  let name = config.name;
  if (name === '$default') {
    name = DEFAULT_MARKER;
  }
  if (name === '$index') {
    name = INDEX_MARKER;
  }
  name = sanitiseFunctionName(name);

  // Start with sanitized path (excluding the function name itself)
  const segments = config.path.split('/');
  const pathSegments = segments.slice(1, -1); // remove empty root + function name

  // Edge case: index route needs disambiguation
  let pathPrefix = pathSegments.join('-');
  if (name === INDEX_MARKER && pathPrefix) {
    pathPrefix += '-index';
  }

  let fullName = [prefix, pathPrefix, name].filter(Boolean).join('-');
  fullName = sanitiseFunctionName(fullName);

  // Ensure max 64 chars
  if (fullName.length > 64) {
    fullName = `${fullName.substring(0, 40)}-${crypto
      .createHash('md5')
      .update(fullName)
      .digest('hex')
      .substring(0, 20)}`;
  }

  return fullName;
};
