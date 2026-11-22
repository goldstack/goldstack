import assert from 'assert';
import fs from 'fs';
import { commandExists, copy, execSafe, execSafeAsync, mkdir, rm, rmSafe, write } from './utilsSh';

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

describe('execSafe', () => {
  const printArgsScript = 'process.stdout.write(JSON.stringify(process.argv.slice(1)))';
  const printCwdScript = 'process.stdout.write(process.cwd())';
  const shellSensitiveArgs = [
    'argument with spaces',
    '$HOME',
    '$(touch should-not-exist)',
    '`touch should-not-exist`',
    '; touch should-not-exist',
    '&& touch should-not-exist',
    'value"with"quotes',
    "value'with'apostrophes",
    'back\\slash',
    '*',
  ];

  it('Should pass arguments literally without shell interpretation', () => {
    const output = execSafe(
      process.execPath,
      ['-e', printArgsScript, '--', ...shellSensitiveArgs],
      {
        silent: true,
      },
    );

    assert.deepStrictEqual(JSON.parse(output), shellSensitiveArgs);
  });

  it('Should pass arguments literally when executed asynchronously', async () => {
    const output = await execSafeAsync(
      process.execPath,
      ['-e', printArgsScript, '--', ...shellSensitiveArgs],
      { silent: true },
    );

    assert.deepStrictEqual(JSON.parse(output), shellSensitiveArgs);
  });

  it('Should execute synchronously in the provided working directory', () => {
    const testDir = './goldstackLocal/work/execSafeCwd/';
    mkdir('-p', testDir);

    try {
      const output = execSafe(process.execPath, ['-e', printCwdScript], {
        cwd: testDir,
        silent: true,
      });

      assert.strictEqual(fs.realpathSync(output), fs.realpathSync(testDir));
    } finally {
      rm('-rf', testDir);
    }
  });

  it('Should execute asynchronously in the provided working directory', async () => {
    const testDir = './goldstackLocal/work/execSafeAsyncCwd/';
    mkdir('-p', testDir);

    try {
      const output = await execSafeAsync(process.execPath, ['-e', printCwdScript], {
        cwd: testDir,
        silent: true,
      });

      assert.strictEqual(fs.realpathSync(output), fs.realpathSync(testDir));
    } finally {
      rm('-rf', testDir);
    }
  });
});
