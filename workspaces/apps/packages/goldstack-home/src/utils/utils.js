import dataUriToBuffer from 'data-uri-to-buffer';
/**
 * Safe handling of uris to buffer to ensure it works in tests.
 */
export const dataUriToSrc = (uri) => {
  if (typeof uri !== 'string') {
    return '';
  }
  if (!uri.startsWith('data:')) {
    return '';
  }
  return dataUriToBuffer(uri).toString();
};
//# sourceMappingURL=utils.js.map
