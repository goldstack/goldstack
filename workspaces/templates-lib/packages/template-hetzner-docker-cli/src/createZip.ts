import { zip, mkdir, rm } from '@goldstack/utils-sh';

export async function createZip() {
  mkdir('-p', './dist/app');

  rm('-f', './dist/app/server.zip');

  zip({
    directory: './server',
    target: './dist/app/server.zip',
  });
}
