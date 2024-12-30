import * as s3Mock from 'mock-aws-s3';
import * as path from 'path';

type S3Mock = typeof s3Mock & {
  applyBasePath: (
    search: Record<string, string> | undefined
  ) => Record<string, string> | undefined;
};

// Save the original function
const originalApplyBasePath = (s3Mock as S3Mock).applyBasePath;

/**
 * Patches the applyBasePath function in mock-aws-s3 to use a custom base path
 * @param customBasePath - Custom base path to be used for S3 operations
 */
export function patchApplyBasePath(customBasePath: string): void {
  (s3Mock as S3Mock).applyBasePath = (
    search: Record<string, string> | undefined
  ): Record<string, string> | undefined => {
    if (search && customBasePath) {
      const modifyKeys = ['Bucket', 'CopySource'];
      const modifiedSearch: Record<string, string> = {};

      for (const [key, value] of Object.entries(search)) {
        modifiedSearch[key] = modifyKeys.includes(key)
          ? path.join(customBasePath, value)
          : value;
      }

      return modifiedSearch;
    }
    // Fallback to the original behavior
    return originalApplyBasePath(search);
  };
}
