import sh, { ShellString } from 'shelljs';
import { filesChanged } from './utilsGit';

// including these rather than using @goldstack/utils-sh to avoid circular dependency
const read = (path: string): string => {
  return sh.cat(path).toString();
};

const write = (content: string, path: string): void => {
  new ShellString(content).to(path);
};

describe('git utils', () => {
  it('Should detect changes', async () => {
    const oldDummy = read('dummy.txt');
    write('testdummy', 'dummy.txt');
    expect(filesChanged()).toBeTruthy();
    write(oldDummy, 'dummy.txt');
  });
});
