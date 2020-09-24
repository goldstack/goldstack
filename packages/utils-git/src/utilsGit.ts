import path from 'path';
// included here in preference to goldstack utils-sh to avoid circular dependency
import sh from 'shelljs';
import { assert } from 'console';

const isDebug = process.env.GOLDSTACK_DEBUG || process.env.DEBUG;

// included here to avoid circular dependency
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debug = (msg: any): void => {
  if (isDebug) {
    console.log(msg);
  }
};

export interface ExecParams {
  silent?: boolean;
}

const exec = (cmd: string, params?: ExecParams): string => {
  const res = sh.exec(cmd, { silent: params?.silent });
  if (!res || res.code != 0) {
    sh.echo(res.stdout);
    sh.echo(res.stderr);
    throw new Error(`Error running '${cmd}'`);
  }
  return res.stdout;
};

export const hash = (): string => {
  if (!sh.which('git')) {
    throw new Error('git is not installed or not available as command.');
  }
  const hash = exec('git rev-parse --short HEAD', { silent: true }).trim();
  return hash;
};

export const filesChanged = (): boolean => {
  const headDiff = sh.exec('git diff "HEAD..HEAD^1" --quiet -- . ');
  const headChanged = headDiff.code !== 0;

  if (headChanged) {
    debug('Detected change against HEAD^1 in ' + path.resolve('.'));
  }

  const fileDiff = sh.exec('git diff --quiet -- . ');
  const fileChanged = fileDiff.code !== 0;

  if (fileChanged) {
    debug('Detected uncommited change in ' + path.resolve('.'));
  }

  if (headChanged || fileChanged) {
    return true;
  } else {
    return false;
  }
};

export const run = (args: string[]): void => {
  assert(args[3] === '--exec');
  const [, , , , ...execCommands] = args;
  const execCommand = execCommands.join(' ');
  if (args[2] === 'changed') {
    if (filesChanged()) {
      const res = sh.exec(execCommand);
      if (res.code !== 0) {
        console.log(res.stdout);
        console.log(res.stderr);
        console.log('Error when running "' + execCommand + '"');
        process.exit(res.code);
      } else {
        console.log(res.stdout);
      }
    } else {
      console.log('No file changes detected in ' + path.resolve('.'));
    }
  } else {
    console.log('Please provide argument changed.');
    process.exit(1);
  }
};
