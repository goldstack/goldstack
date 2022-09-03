import { StaticFileMapperBuild } from './staticFileMapperBuild';

import { mkdir, read, rmSafe, write } from '@goldstack/utils-sh';
import assert from 'assert';

describe('Static file mapper', () => {
  let mapper: StaticFileMapperBuild | undefined;
  beforeAll(async () => {
    await rmSafe('./testDir');
    mkdir('-p', './testDir');
    mkdir('-p', './testDir/files');

    write('[]', './testDir/store.json');
    mapper = new StaticFileMapperBuild({
      dir: './testDir/files',
      storePath: './testDir/store.json',
    });
  });
  it('Should create and update one mapping correctly', async () => {
    assert(mapper);
    expect(await mapper.has({ name: 'file1' })).toBeFalsy();

    await mapper.put({
      name: 'file1',
      generatedName: 'file1.[hash].js',
      content: 'const re=1;',
    });

    expect(await mapper.has({ name: 'file1' })).toBeTruthy();

    expect(await mapper.resolve({ name: 'file1' })).toContain('file1.');

    const filePath = await mapper.resolve({ name: 'file1' });
    expect(filePath).toContain('file1.');
    expect(read(`./testDir/files/${filePath}`)).toContain('re=');
    await mapper.put({
      name: 'file1',
      generatedName: 'file1.[hash].js',
      content: 'const newValue=1;',
    });

    const changedFilePath = await mapper.resolve({ name: 'file1' });
    expect(changedFilePath).toContain('file1.');
    expect(read(`./testDir/files/${changedFilePath}`)).toContain('newValue');
  });
  it('Should create and update mappings with more than one name correctly', async () => {
    assert(mapper);

    await mapper.put({
      name: 'dev-file2',
      generatedName: 'file2.[hash].js',
      content: 'const re=1;',
    });

    await mapper.put({
      name: 'prod-file2',
      generatedName: 'file2.[hash].js',
      content: 'const re=1;',
    });

    expect(await mapper.has({ name: 'prod-file2' })).toBeTruthy();
    expect(await mapper.has({ name: 'dev-file2' })).toBeTruthy();

    expect(await mapper.resolve({ name: 'dev-file2' })).toContain('file2');

    await mapper.put({
      name: 'prod-file2',
      generatedName: 'file2.[hash].js',
      content: 'const soFresh=1;',
    });

    await mapper.remove({ name: 'dev-file2' });
    expect(await mapper.has({ name: 'prod-file2' })).toBeTruthy();

    await mapper.remove({ name: 'prod-file2' });
    expect(await mapper.has({ name: 'prod-file2' })).toBeFalsy();
  });
});
