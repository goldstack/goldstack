import fs from 'fs';
import { rmSafe, write, mkdir, copy } from './utilsSh';
import assert from 'assert';

describe('Copy', () => {
  beforeAll(async () => {
    await rmSafe('./work');
    mkdir('-p', './work');
  });

  it('Should copy all files (including hidden)', async () => {
    const testDir = './goldstackLocal/work/copyAll/';
    mkdir('-p', testDir);
    write('dummy', testDir + '.hidden');
    write('dummy', testDir + 'normal.txt');
    mkdir('-p', testDir + 'dir/');
    write('dummy', testDir + 'dir/.hidden');
    write('dummy', testDir + 'dir/normal.txt');

    const destDir = './goldstackLocal/work/copyAllDest/';
    await copy(testDir, destDir);

    assert(
      fs.existsSync(destDir + 'normal.txt'),
      `Cannot find ${destDir + 'normal.txt'}`
    );
    assert(fs.existsSync(destDir + '.hidden'));
    assert(fs.existsSync(destDir + 'dir/.hidden'));
    assert(fs.existsSync(destDir + 'dir/normal.txt'));
  });

  it('Should copy a single file', async () => {
    const testDir = './goldstackLocal/work/copySingle/';
    mkdir('-p', testDir);
    write('dummy', testDir + 'normal.txt');
    const destDir = './goldstackLocal/work/copySingleDest/';
    mkdir('-p', destDir);
    await copy(testDir + 'normal.txt', destDir);
    assert(fs.existsSync(destDir + 'normal.txt'));
  });
});
