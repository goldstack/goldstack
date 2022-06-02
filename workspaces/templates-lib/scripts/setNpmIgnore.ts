import { readdirSync, readFileSync, writeFileSync } from 'fs';

const getDirectories = (source): string[] =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

const dirs = getDirectories('./packages');

const template = readFileSync('./scripts/.npmignore', 'utf8');

for (const dir of dirs) {
  const file = `./packages/${dir}/.npmignore`;

  writeFileSync(file, template);
}
