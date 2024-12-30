import { S3Client } from '@aws-sdk/client-s3';
import { excludeInBundle } from '@goldstack/utils-esbuild';
import { warn } from '@goldstack/utils-log';

let s3MockUsed = false;

export function connectLocal() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const MockS3 = require(excludeInBundle('mock-aws-s3-v3'));
  const s3 = MockS3.createS3Client('goldstackLocal/s3');

  (s3 as any)._goldstackIsMocked = true;
  s3MockUsed = true;
  return s3 as any;
}

export const isMocked = (client: S3Client): boolean => {
  return (client as any)._goldstackIsMocked === true;
};

export function resetMocksIfRequired(
  deploymentName: string | undefined,
  goldstackConfig: any
) {
  if (s3MockUsed) {
    warn(
      'Initialising a real S3 bucket after a mocked one had been created it. All mocks are reset.',
      {
        deploymentName,
        package: goldstackConfig.name,
      }
    );
    // only require this for local testing
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const MockS3 = require(excludeInBundle('mock-aws-s3-v3'));
    MockS3.resetMocks();
  }
}
