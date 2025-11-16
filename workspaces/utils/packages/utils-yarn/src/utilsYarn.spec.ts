import assert from 'assert';
import path from 'path';
import { assertYarn, hasYarn, yarn } from './utilsYarn';

describe('Utils yarn', () => {
  it('Should be able to run yarn', () => {
    assert(hasYarn());
    assertYarn();
    yarn(path.resolve('./../../../../'), 'npm info'); // will run 'yarn npm info'
  });
});
