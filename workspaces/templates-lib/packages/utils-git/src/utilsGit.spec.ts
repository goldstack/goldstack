import { filesChanged } from './utilsGit';
import fs from 'fs';

const read = (path: string): string => {
  const buffer = fs.readFileSync(path, 'utf8');
  return buffer.toString();
};

const write = (content: string, path: string): void => {
  fs.writeFileSync(path, content);
};

describe('git utils', () => {
  it('Should detect changes', async () => {
    const oldDummy = read('dummy.txt');
    write('testdummy', 'dummy.txt');
    expect(filesChanged()).toBeTruthy();
    write(oldDummy, 'dummy.txt');
  });
});
