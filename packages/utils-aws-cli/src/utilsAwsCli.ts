import { sh, exec, pwd, cd, ExecParams } from '@goldstack/utils-sh';
import { fatal } from '@goldstack/utils-log';
import { AWSAPIKeyUser } from '@goldstack/infra-aws';
import {
  imageGoldstackBuild,
  hasDocker,
  assertDocker,
} from '@goldstack/utils-docker';

export const assertAwsCli = (): void => {
  if (!sh.which('aws')) {
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

export const execWithDocker = (params: AWSExecParams): string => {
  assertDocker();

  const awsUserConfig =
    `-e AWS_ACCESS_KEY_ID=${params.credentials.accessKeyId} ` +
    `-e AWS_SECRET_ACCESS_KEY=${params.credentials.secretAccessKey} ` +
    `-e AWS_SESSION_TOKEN=${params.credentials.sessionToken || ''} ` +
    `-e AWS_DEFAULT_REGION=${params.region} `;
  const mountDir = params.workDir || pwd();

  return exec(
    'docker run --rm ' +
      awsUserConfig +
      `-v "${mountDir}":/app ` +
      ` ${imageGoldstackBuild()} aws ${params.command}`,
    params.options
  );
};

export const execWithCli = (params: AWSExecParams): string => {
  assertAwsCli();

  sh.env['AWS_ACCESS_KEY_ID'] = params.credentials.accessKeyId;
  sh.env['AWS_SECRET_ACCESS_KEY'] = params.credentials.secretAccessKey;
  sh.env['AWS_SESSION_TOKEN'] = params.credentials.sessionToken || '';
  sh.env['AWS_DEFAULT_REGION'] = params.region;

  cd(params.workDir || pwd());
  return exec(`aws ${params.command}`, params.options);
};

export const awsCli = (params: AWSExecParams): string => {
  if (hasDocker()) {
    return execWithDocker(params);
  }

  return execWithCli(params);
};
