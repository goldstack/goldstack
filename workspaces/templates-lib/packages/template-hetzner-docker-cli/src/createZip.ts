import { zip, mkdir, rm, exec } from '@goldstack/utils-sh';
import { createHash } from 'crypto';
import { writeFileSync } from 'fs';

export async function createZip() {
  mkdir('-p', './dist/app');

  rm('-f', './dist/app/server.zip');

  zip({
    directory: './server',
    target: './dist/app/server.zip',
  });

  const hash = createHash('sha256');
  const zipFilePath = './dist/app/server.zip';
  const zipFileContent = exec(`cat ${zipFilePath}`);
  hash.update(zipFileContent);

  const hashValue = hash.digest('hex');
  writeFileSync('./dist/app/current', hashValue);
}
