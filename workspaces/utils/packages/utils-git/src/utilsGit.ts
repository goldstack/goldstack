import { execSync } from 'child_process';
import cmdExists from 'command-exists';
// included here in preference to goldstack utils-sh to avoid circular dependency
import { assert } from 'console';
import path from 'path';

const isDebug = process.env.GOLDSTACK_DEBUG || process.env.DEBUG;

// included here to avoid circular dependency for log package

const debug = (msg: unknown): void => {
  if (isDebug) {
    console.log(msg);
  }
};

const exec = (cmd: string, params?: ExecParams): string => {
  const res = execSync(cmd);
  if (!params?.silent) {
    console.log(res.toString());
  }
  return res.toString();
};
export interface ExecParams {
  silent?: boolean;
}

export const hash = (): string => {
  if (!cmdExists('git')) {
    throw new Error('git is not installed or not available as command.');
  }
  const hash = exec('git rev-parse --short HEAD', { silent: true }).trim();
  return hash;
};

export const filesChanged = (): boolean => {
  let headChanged = false;
  let fileChanged = false;
  try {
    exec('git diff "HEAD..HEAD^1" --quiet -- . ');
  } catch (_e) {
    debug(`Detected change against HEAD^1 in ${path.resolve('.')}`);
    headChanged = true;
  }
  try {
    exec('git diff --quiet -- . ');
  } catch (_e) {
    debug(`Detected uncommited change in ${path.resolve('.')}`);
    fileChanged = true;
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
      try {
        const res = exec(execCommand);
        console.log(res);
      } catch (_e) {
        console.error(`Error when running "${execCommand}"`);
        process.exit(1);
      }
    } else {
      console.log(`No file changes detected in ${path.resolve('.')}`);
    }
  } else {
    console.log('Please provide argument changed.');
    process.exit(1);
  }
};
