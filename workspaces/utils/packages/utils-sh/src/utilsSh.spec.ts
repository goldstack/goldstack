import assert from 'assert';
import fs from 'fs';
import { commandExists, copy, mkdir, rm, rmSafe, write } from './utilsSh';

describe('Copy', () => {
  beforeAll(async () => {
    await rmSafe('./goldstackLocal/work');
    mkdir('-p', './goldstackLocal/work');
  });

  it('Should copy all files (including hidden)', async () => {
    const testDir = './goldstackLocal/work/copyAll/';
    mkdir('-p', testDir);
    write('dummy', `${testDir}.hidden`);
    write('dummy', `${testDir}normal.txt`);
    mkdir('-p', `${testDir}dir/`);
    write('dummy', `${testDir}dir/.hidden`);
    write('dummy', `${testDir}dir/normal.txt`);

    const destDir = './goldstackLocal/work/copyAllDest/';
    await copy(testDir, destDir);

    assert(fs.existsSync(`${destDir}normal.txt`), `Cannot find ${`${destDir}normal.txt`}`);
    assert(fs.existsSync(`${destDir}.hidden`));
    assert(fs.existsSync(`${destDir}dir/.hidden`));
    assert(fs.existsSync(`${destDir}dir/normal.txt`));
  });

  it('Should copy a single file', async () => {
    const testDir = './goldstackLocal/work/copySingle/';
    mkdir('-p', testDir);
    write('dummy', `${testDir}normal.txt`);
    const destDir = './goldstackLocal/work/copySingleDest/';
    mkdir('-p', destDir);
    await copy(`${testDir}normal.txt`, destDir);
    assert(fs.existsSync(`${destDir}normal.txt`));
  });
});

describe('Command Exists', () => {
  it('Should determine if a command does not exist', () => {
    assert(commandExists('echo'));
    assert(!commandExists('thisCertainlyDoesNotExist'));
  });
});

describe('rm', () => {
  it('Should remove directory and all contents', () => {
    const testDir = './goldstackLocal/work/rmTest/';
    mkdir('-p', testDir);
    write('dummy', `${testDir}file.txt`);
    mkdir('-p', `${testDir}subdir/`);
    write('dummy', `${testDir}subdir/file.txt`);

    assert(fs.existsSync(testDir));
    assert(fs.existsSync(`${testDir}file.txt`));
    assert(fs.existsSync(`${testDir}subdir/file.txt`));

    rm('-rf', testDir);

    // Directory should be completely removed
    assert(!fs.existsSync(testDir));
  });
});
