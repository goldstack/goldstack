import {
  commandExists,
  exec,
  pwd,
  cd,
  ExecParams,
  assertDirectoryExists,
  execAsync,
} from '@goldstack/utils-sh';
import AWS from 'aws-sdk';
import { fatal } from '@goldstack/utils-log';
import { hasDocker, assertDocker, imageAWSCli } from '@goldstack/utils-docker';

export const assertAwsCli = (): void => {
  if (!commandExists('aws')) {
    fatal(
      'AWS CLI version 2 not available.\n\nEnsure AWS cli or Docker (preferred) are available commands in the command line.'
    );
    throw new Error();
  }

  const version = exec('aws --version', { silent: true });

  if (version.indexOf('aws-cli/2.') <= -1) {
    fatal(
      `Wrong AWS cli version installed. Expected version 2 but found version '${version}'` +
        '\n\nEither install AWS cli or Docker (preferred).'
    );
    throw new Error();
  }
};

interface AWSExecParams {
  credentials: AWS.Credentials;
  command: string;
  region: string;
  workDir?: string;
  options?: ExecParams;
}

export const execWithDocker = async (
  params: AWSExecParams
): Promise<string> => {
  assertDocker();

  const awsUserConfig =
    `-e AWS_ACCESS_KEY_ID=${params.credentials.accessKeyId} ` +
    `-e AWS_SECRET_ACCESS_KEY=${params.credentials.secretAccessKey} ` +
    `-e AWS_SESSION_TOKEN=${params.credentials.sessionToken || ''} ` +
    `-e AWS_DEFAULT_REGION=${params.region} `;
  const mountDir = params.workDir || pwd();

  assertDirectoryExists(
    mountDir,
    'Cannot execute AWS cli command since working directory does not exist: aws ' +
      params.command
  );
  const command =
    'docker run --rm ' +
    awsUserConfig +
    `-v "${mountDir}":/app ` +
    '-w /app ' +
    ` ${imageAWSCli()} ${params.command}`;
  return execAsync(command, params.options);
};

export const execWithCli = async (params: AWSExecParams): Promise<string> => {
  assertAwsCli();

  process.env.AWS_ACCESS_KEY_ID = params.credentials.accessKeyId;
  process.env.AWS_SECRET_ACCESS_KEY = params.credentials.secretAccessKey;
  process.env.AWS_SESSION_TOKEN = params.credentials.sessionToken || '';
  process.env.AWS_DEFAULT_REGION = params.region;

  assertDirectoryExists(
    params.workDir || pwd(),
    'Cannot execute command for AWS cli: aws ' + params.command
  );

  const previousDir = pwd();
  cd(params.workDir || pwd());
  try {
    const command = `aws ${params.command}`;
    return await execAsync(command, params.options);
  } finally {
    cd(previousDir);
  }
};

export const awsCli = async (params: AWSExecParams): Promise<string> => {
  if (hasDocker()) {
    return execWithDocker(params);
  }

  return execWithCli(params);
};
