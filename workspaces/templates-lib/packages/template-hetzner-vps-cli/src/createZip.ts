import { zip, mkdir, rm, exec } from '@goldstack/utils-sh';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';

export async function createZip() {
  mkdir('-p', './dist/app');

  rm('-f', './dist/app/server.zip');

  await zip({
    directory: './server',
    target: './dist/app/server.zip',
  });

  const hash = createHash('sha256');
  const zipFilePath = './dist/app/server.zip';
  const zipFileContent = readFileSync(zipFilePath);
  hash.update(zipFileContent);

  let hashValue = hash.digest('hex');

  const credentialsHash = createHash('sha256');
  const credentialsFilePath = './dist/credentials/credentials';
  const credentialsFileContent = readFileSync(credentialsFilePath);
  credentialsHash.update(credentialsFileContent);
  hashValue += credentialsHash.digest('hex');

  writeFileSync('./dist/app/current', hashValue);
}
