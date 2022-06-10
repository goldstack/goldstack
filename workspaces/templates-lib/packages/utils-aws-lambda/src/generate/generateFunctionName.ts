import { LambdaConfig } from './collectLambdasFromFiles';
import crypto from 'crypto';

const INDEX_MARKER = '__index';
const DEFAULT_MARKER = '__default';

const sanitiseFunctionName = (input: string): string => {
  return input
    .replace(/\//g, '-')
    .replace(/\$/g, '_')
    .replace(/\{/g, '_')
    .replace(/\}/g, '_')
    .replace(/\+/g, '_')
    .replace(/[^\w\-_]/gi, '_');
};

/**
 * Generates a valid function name for a route
 */
export const generateFunctionName = (
  prefix: string | undefined,
  config: LambdaConfig
): string => {
  let name = config.name;
  if (name === '$default') {
    // '$' is not a valid character in a lambda function name
    name = DEFAULT_MARKER;
  }
  if (name === '$index') {
    name = INDEX_MARKER;
  }
  name = sanitiseFunctionName(name);

  let pathPrefix = '';
  const segments = config.path.split('/');
  if (segments.length === 2 && name === INDEX_MARKER) {
    pathPrefix = `${segments[1]}-`;
  }
  if (segments.length > 2) {
    segments.shift(); // remove first element since path starts with '/' and thus the first element is always ''
    segments.pop(); // remove the last element since that is the name of the function in the route
    pathPrefix = sanitiseFunctionName(segments.join('-'));
    pathPrefix = `${pathPrefix}-`;
  }

  name = `${pathPrefix}${name}`;
  if (prefix) {
    name = `${prefix}-` + name;
  }

  // Lambda names cannot be larger than 64 characters
  // in that case shorten name and append a hash
  if (name.length > 64) {
    name = `${name.substring(0, 40)}-${crypto
      .createHash('md5')
      .update(name)
      .digest('hex')
      .substring(0, 20)}`;
  }
  return name;
};
