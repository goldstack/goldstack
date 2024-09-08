import { zip, mkdir, rm } from '@goldstack/utils-sh';

export async function createZip() {
  mkdir('-p', './dist');

  rm('-f', './dist/server.zip');

  zip({
    directory: './server',
    target: './dist/server.zip',
  });
}
