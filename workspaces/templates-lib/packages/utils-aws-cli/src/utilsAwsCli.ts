import type { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import { getAWSCredentials } from '@goldstack/infra-aws';
import { assertDocker, hasDocker, imageAWSCli } from '@goldstack/utils-docker';
import { debug, fatal } from '@goldstack/utils-log';
import {
  assertDirectoryExists,
  commandExists,
  type ExecParams,
  exec,
  execSafeAsync,
  pwd,
} from '@goldstack/utils-sh';

export const hasAwsCli = (): boolean => {
  return commandExists('aws');
};

export const assertAwsCli = (): void => {
  if (!commandExists('aws')) {
    fatal(
      'AWS CLI version 2 not available.\n\nEnsure AWS cli or Docker (preferred) are available commands in the command line.',
    );
    throw new Error();
  }

  const version = exec('aws --version', { silent: true });

  if (version.indexOf('aws-cli/2.') <= -1) {
    fatal(
      `Wrong AWS cli version installed. Expected version 2 but found version '${version}'` +
        '\n\nEither install AWS cli or Docker.',
    );
    throw new Error();
  }
};

interface AWSExecParams {
  credentials: AwsCredentialIdentityProvider;
  /**
   * The AWS CLI arguments, for example `['s3', 'sync', '.', 's3://bucket/path']`.
   * Passing arguments separately avoids shell parsing and quoting issues.
   */
  args?: string[];
  /**
   * @deprecated Use `args` instead. The command string is tokenised without invoking a
   * shell, so shell expansion such as `$VAR` or `*` will not be performed.
   */
  command?: string;
  region: string;
  workDir?: string;
  options?: ExecParams;
}

/**
 * Splits a command string into arguments, honouring single and double quotes. This does not
 * perform shell expansion and is only used to remain backwards compatible with the deprecated
 * `command` parameter.
 *
 * @param command the command string to split
 * @returns the individual command arguments
 */
export const splitCommandString = (command: string): string[] => {
  const args: string[] = [];
  let current = '';
  let quote: '"' | "'" | undefined;
  let hasContent = false;

  for (let i = 0; i < command.length; i++) {
    const char = command[i];

    if (quote) {
      if (char === quote) {
        quote = undefined;
        continue;
      }
      if (char === '\\' && quote === '"' && i + 1 < command.length) {
        const next = command[i + 1];
        if (next === '"' || next === '\\') {
          current += next;
          i++;
          continue;
        }
      }
      current += char;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      hasContent = true;
      continue;
    }

    if (/\s/.test(char)) {
      if (hasContent) {
        args.push(current);
        current = '';
        hasContent = false;
      }
      continue;
    }

    current += char;
    hasContent = true;
  }

  if (quote) {
    throw new Error(`Unterminated quote in command: ${command}`);
  }
  if (hasContent) {
    args.push(current);
  }
  return args;
};

const getArgs = (params: AWSExecParams): string[] => {
  if (params.args) {
    return params.args;
  }
  if (params.command) {
    return splitCommandString(params.command);
  }
  throw new Error("AWS CLI arguments must be provided using the 'args' parameter.");
};

export const execWithDocker = async (params: AWSExecParams): Promise<string> => {
  assertDocker();

  const args = getArgs(params);
  const credentials = await getAWSCredentials(params.credentials);
  const mountDir = params.workDir || pwd();

  assertDirectoryExists(
    mountDir,
    `Cannot execute AWS cli command since working directory does not exist: aws ${args.join(' ')}`,
  );

  const dockerArgs = [
    'run',
    '--rm',
    '-e',
    `AWS_ACCESS_KEY_ID=${credentials.accessKeyId}`,
    '-e',
    `AWS_SECRET_ACCESS_KEY=${credentials.secretAccessKey}`,
    '-e',
    `AWS_SESSION_TOKEN=${credentials.sessionToken || ''}`,
    '-e',
    `AWS_REGION=${params.region}`,
    '-e',
    `AWS_DEFAULT_REGION=${params.region}`,
    '-v',
    `${mountDir}:/app`,
    '-w',
    '/app',
    imageAWSCli(),
    ...args,
  ];
  return execSafeAsync('docker', dockerArgs, params.options);
};

export const execWithCli = async (params: AWSExecParams): Promise<string> => {
  assertAwsCli();

  const args = getArgs(params);
  const credentials = await getAWSCredentials(params.credentials);
  process.env.AWS_ACCESS_KEY_ID = credentials.accessKeyId;
  process.env.AWS_SECRET_ACCESS_KEY = credentials.secretAccessKey;
  process.env.AWS_SESSION_TOKEN = credentials.sessionToken || '';
  process.env.AWS_REGION = params.region;
  process.env.AWS_DEFAULT_REGION = params.region;

  const workDir = params.workDir || pwd();
  assertDirectoryExists(workDir, `Cannot execute command for AWS cli: aws ${args.join(' ')}`);

  debug(`AWS command to be executed:\n  aws ${args.join(' ')}`);
  return await execSafeAsync('aws', args, { ...params.options, cwd: workDir });
};

export const awsCli = async (params: AWSExecParams): Promise<string> => {
  if (hasAwsCli()) {
    return execWithCli(params);
  }

  if (!hasDocker()) {
    fatal(
      'AWS CLI version 2 not available.\n\nEnsure AWS cli (preferred) or Docker are available commands in the command line.',
    );
  }

  return execWithDocker(params);
};
