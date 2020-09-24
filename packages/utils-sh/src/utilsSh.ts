import sh, { ShellString } from 'shelljs';

import fs from 'fs';
import ncp from 'ncp';

import path from 'path';

import rimraf from 'rimraf';

import archiver from 'archiver';
import extract from 'extract-zip';

export interface ExecParams {
  silent?: boolean;
}

export const copy = async (
  source: string[] | string,
  dest: string
): Promise<void> => {
  let sourceArr: string[];
  if (Array.isArray(source)) {
    sourceArr = source;
  } else {
    sourceArr = [source];
  }

  for (const sourceEl of sourceArr) {
    await new Promise((resolve, reject) => {
      let destCorrected: string;
      if (!fs.lstatSync(sourceEl).isDirectory()) {
        destCorrected = dest + path.basename(sourceEl);
      } else {
        destCorrected = dest;
      }

      ncp(sourceEl, destCorrected, { stopOnErr: true }, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
};

export const cp = (
  options: string,
  source: string | string[],
  dest: string
): void => {
  const res = sh.cp(options, source, dest);

  if (!res || res.code !== 0) {
    sh.echo(res.stdout);
    sh.echo(res.stderr);
    throw new Error(`Cannot copy ${source} to ${dest}.`);
  }
};

/**
 * Works better in Windows environment, since automatic retires are attempted when there is a temporary error.
 */
export const rmSafe = async (...files: string[]): Promise<void> => {
  for (const file of files) {
    await new Promise((resolve, reject) => {
      rimraf(
        file,
        {
          maxBusyTries: 10,
        },
        (e) => {
          if (e) {
            reject(e);
            return;
          }
          resolve();
        }
      );
    });
  }
};

export const rm = (options: string, ...files: string[]): void => {
  for (const file of files) {
    rimraf.sync(file); // sh.rm(options, files);
    // if (!res || res.code !== 0) {
    //   sh.echo(res.stdout);
    //   sh.echo(res.stderr);
    //   throw new Error(`Cannot remove ${file}`);
    // }
  }
};

export const mkdir = (options: string, ...dir: string[]): void => {
  const res = sh.mkdir(options, dir);
  if (!res || res.code !== 0) {
    sh.echo(res.stdout);
    sh.echo(res.stderr);
    throw new Error(`Cannot create directory ${dir}`);
  }
};

export const zip = async (params: {
  directory: string;
  target: string;
}): Promise<void> => {
  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(params.target);
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    archive.on('warning', function (err) {
      console.warn(err.message);
    });

    output.on('finish', () => {
      resolve();
    });
    output.on('error', reject);

    // pipe archive data to the file
    archive.pipe(output);

    archive.directory(params.directory, false);

    archive.finalize();
  });
};

/**
 * Unzips a zip file into directly into a directory.
 */
export const unzip = async (params: {
  file: string;
  targetDirectory: string;
}): Promise<void> => {
  await extract(params.file, {
    dir: path.resolve(params.targetDirectory),
  });
};

export const tempDir = (): string => {
  if (process.env.GOLDSTACK_WORKDIR) {
    return process.env.GOLDSTACK_WORKDIR;
  }
  return './goldstackLocal/';
};

const exec = (cmd: string, params?: ExecParams): string => {
  const res = sh.exec(cmd, { silent: params?.silent });
  if (!res || res.code != 0) {
    sh.echo(res.stdout);
    sh.echo(res.stderr);
    throw new Error(`Error running '${cmd}'`);
  }
  return res.stdout;
};

const read = (path: string): string => {
  return sh.cat(path).toString();
};

const write = (content: string, path: string): void => {
  new ShellString(content).to(path);
};

const pwd = (): string => sh.pwd().toString();

const cd = sh.cd;

export { exec, pwd, read, write, sh, cd };
