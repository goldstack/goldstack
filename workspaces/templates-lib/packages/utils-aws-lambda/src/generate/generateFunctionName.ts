import crypto from 'crypto';
import type { LambdaConfig } from './../types/LambdaConfig';

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
export const generateFunctionName = (prefix: string | undefined, config: LambdaConfig): string => {
  let name = config.name;

  if (name === '$default') {
    name = DEFAULT_MARKER;
  }
  if (name === '$index') {
    name = INDEX_MARKER;
  }

  name = sanitiseFunctionName(name);

  const segments = config.path.split('/').filter(Boolean); // remove empty segment from start

  let pathPrefix = '';
  if (segments.length > 1) {
    // e.g. /foo/bar/$index.ts → ['foo', 'bar']
    pathPrefix = sanitiseFunctionName(segments.slice(0, -1).join('-'));
  } else if (segments.length === 1 && name === INDEX_MARKER) {
    // e.g. /health/$index.ts → ['health']
    pathPrefix = sanitiseFunctionName(segments[0]);
  }

  if (pathPrefix && name === INDEX_MARKER) {
    pathPrefix += '-index';
  }

  let fullName = [prefix, pathPrefix, name].filter(Boolean).join('-');
  fullName = sanitiseFunctionName(fullName);

  // Lambda function name limit
  if (fullName.length > 64) {
    fullName = `${fullName.substring(0, 40)}-${crypto
      .createHash('md5')
      .update(fullName)
      .digest('hex')
      .substring(0, 20)}`;
  }

  return fullName;
};
