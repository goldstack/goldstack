import assert from 'assert';
import path from 'path';
import { packageEdgeLambda } from './../edgeLambdaPackage';

describe('Edge Lambda packaging', () => {
  test('Can package js', async () => {
    const destFile = path.resolve('./../../goldstackLocal/lambda.js');
    await packageEdgeLambda({
      sourceFile: './testData/compiledLambda/lambda.js',
      destFile,
    });

    const lib = require(destFile);
    assert(typeof lib.handler === 'function');
  });
});
