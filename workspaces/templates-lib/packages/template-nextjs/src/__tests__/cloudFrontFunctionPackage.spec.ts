import assert from 'assert';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import vm from 'vm';
import {
  CLOUDFRONT_FUNCTION_SIZE_LIMIT,
  packageCloudFrontFunction,
} from './../cloudFrontFunctionPackage';

interface HandlerContext {
  handler?: (event: { request: { uri: string } }) => { uri: string };
}

describe('CloudFront function packaging', () => {
  const outputDir = path.resolve('./../../goldstackLocal');

  beforeAll(() => {
    mkdirSync(outputDir, { recursive: true });
  });

  test('packages the handler as a global function', async () => {
    const destFile = path.join(outputDir, 'function.js');
    await packageCloudFrontFunction({
      sourceFile: './testData/compiledCloudFrontFunction/handler.js',
      destFile,
    });

    const context: HandlerContext = {};
    vm.runInNewContext(readFileSync(destFile, 'utf8'), context);

    assert.strictEqual(typeof context.handler, 'function');
    assert.strictEqual(context.handler?.({ request: { uri: '/foo' } }).uri, '/foo');
  });

  test('rejects bundles that exceed the CloudFront Functions size limit', async () => {
    const sourceFile = path.join(outputDir, 'oversized-handler.js');
    const destFile = path.join(outputDir, 'oversized-function.js');
    const padding = 'x'.repeat(CLOUDFRONT_FUNCTION_SIZE_LIMIT);
    writeFileSync(
      sourceFile,
      `function handler(event) { var padding = "${padding}"; if (padding.length === -1) { return { statusCode: 500 }; } return event.request; }\n`,
    );

    await expect(packageCloudFrontFunction({ sourceFile, destFile })).rejects.toThrow(/exceeds/);
  });
});
