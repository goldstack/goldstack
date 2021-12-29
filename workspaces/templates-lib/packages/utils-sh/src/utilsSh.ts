import { execSync, exec as processAsync } from 'child_process';
import fs from 'fs';
import ncp from 'ncp';

import fse from 'fs-extra';

import path from 'path';

import rimraf from 'rimraf';

import archiver from 'archiver';
import extract from 'extract-zip';

import which from 'which';

import { sync as globSync } from 'glob';

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
    const files = globSync(sourceEl);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await new Promise<void>((resolve, reject) => {
        let destCorrected: string;
        if (!fs.lstatSync(file).isDirectory()) {
          destCorrected = dest + path.basename(file);
        } else {
          destCorrected = dest;
        }
        ncp(file, destCorrected, { stopOnErr: true }, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    }
  }
};

export const assertFileExists = (filePath: string): void => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File '${filePath}' expected to exist but it does not`);
  }
  if (!fs.statSync(filePath).isFile()) {
    throw new Error(
      `Expected file at path '${filePath}' but found directory instead.`
    );
  }
};

export const assertDirectoryExists = (
  directoryPath: string,
  errorMesssage?: string
): void => {
  if (!fs.existsSync(directoryPath)) {
    throw new Error(
      `Directory '${directoryPath}' expected to exist but it does not. ${
        errorMesssage || ''
      }`
    );
  }
  if (!fs.statSync(directoryPath).isDirectory()) {
    throw new Error(
      `Expected directory at path '${directoryPath}' but found file instead. ${
        errorMesssage || ''
      }`
    );
  }
};

const assertDir = (filePath: string): void => {
  const dirname = path.dirname(filePath);
  mkdir('-p', dirname);
};

interface CopyOptions {
  overwrite: boolean;
}

const cpSingle = (
  singleSource: string,
  dest: string,
  copySyncOptions: CopyOptions
): void => {
  const isDestDirectory =
    fs.existsSync(dest) && fs.lstatSync(dest).isDirectory();
  const isSourceDirectory = fs.lstatSync(singleSource).isDirectory();
  if (isDestDirectory) {
    assertDir(dest);
  }
  // see https://github.com/jprichardson/node-fs-extra/blob/HEAD/docs/copy-sync.md
  // https://github.com/jprichardson/node-fs-extra/issues/323
  if (isDestDirectory && !isSourceDirectory) {
    fse.copySync(
      singleSource,
      `${dest}/${path.basename(singleSource)}`,
      copySyncOptions
    );
    return;
  }
  if (isDestDirectory && isSourceDirectory) {
    // copy directory as sub-directory
    fse.copySync(
      singleSource,
      `${dest}/${path.basename(singleSource)}`,
      copySyncOptions
    );
    return;
  }
  fse.copySync(singleSource, dest, copySyncOptions);
};

export const cp = (
  options: string,
  source: string | string[],
  dest: string
): void => {
  if (options !== '-f' && options !== '-rf' && options !== '') {
    throw new Error('Unknown option for cp ' + options);
  }

  const copySyncOptions = {
    overwrite: options.indexOf('f') !== -1,
  };

  if (Array.isArray(source)) {
    (source as string[]).forEach((singleSource) => {
      cpSingle(singleSource, dest, copySyncOptions);
    });
  } else {
    assertDir(dest);
    cpSingle(source as string, dest, copySyncOptions);
  }
};

/**
 * Safer delete in Windows environment, since automatic retires are attempted when there is a temporary error.
 */
export const rmSafe = async (...files: string[]): Promise<void> => {
  for (const file of files) {
    await new Promise<void>((resolve, reject) => {
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

export const mkdir = (options: string, ...dirs: string[]): void => {
  dirs.forEach((dir) => {
    fs.mkdirSync(dir, {
      recursive: options.indexOf('-p') >= 0,
    });
  });
};

export const zip = async (params: {
  directory: string;
  target: string;
  mode?: number;
}): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
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

    archive.directory(params.directory, false, {
      mode: params.mode,
    });

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
  try {
    const res = execSync(cmd);
    if (!params?.silent) {
      console.log(res.toString());
    }
    return res.toString();
  } catch (e) {
    console.error('Command failed:', cmd);
    if (e.stderr) {
      console.error(e.stderr.toString());
    }
    if (e.stdout) {
      console.log(e.stdout.toString());
    }
    throw e;
  }
};

export const execAsync = async (
  cmd: string,
  params?: ExecParams
): Promise<string> => {
  return new Promise((resolve, reject) => {
    processAsync(cmd, (err, stdout, stderr) => {
      if (!params?.silent) {
        console.log(stdout.toString());
      }
      if (err) {
        console.error('Command failed:', cmd);
        if (stderr) {
          console.error(stderr.toString());
        }
        reject(err);
        return;
      }
      resolve(stdout.toString());
    });
  });
};
const read = (path: string): string => {
  const buffer = fs.readFileSync(path, 'utf8');
  return buffer.toString();
};

const write = (content: string, path: string): void => {
  fs.writeFileSync(path, content);
};

const pwd = (): string => process.cwd();

const cd = (newdir: string): void => {
  process.chdir(newdir);
};

const commandExists = (command: string): boolean => {
  const res = which.sync(command, { nothrow: true });
  return res !== null;
};

export { exec, pwd, read, write, cd, globSync, commandExists };
