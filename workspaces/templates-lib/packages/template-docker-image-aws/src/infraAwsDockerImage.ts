import {
  type DeploymentState,
  getDeploymentState as infraGetDeploymentState,
  readDeploymentState,
  readTerraformStateVariable,
  validateDeploymentsState,
  writeDeploymentState,
} from '@goldstack/infra';
import { getAWSUser } from '@goldstack/infra-aws';
import { awsCli } from '@goldstack/utils-aws-cli';
import { assertDocker } from '@goldstack/utils-docker';
import { hash } from '@goldstack/utils-git';
import { exec } from '@goldstack/utils-sh';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';
import configSchema from './schemas/configSchema.json';
import type {
  AWSDockerImageDeployment,
  AWSDockerImagePackage,
} from './types/AWSDockerImagePackage';

export const getConfigSchema = (): object => configSchema;

export const deploy = async (
  config: AWSDockerImagePackage,
  deployment: AWSDockerImageDeployment,
): Promise<void> => {
  const deploymentState = readDeploymentState('./', deployment.name, {
    createIfNotExist: true,
  });
  const repoUrl = readTerraformStateVariable(deploymentState, 'repo_url');
  assertDocker();

  const ecrLoginPassword = (
    await awsCli({
      credentials: await getAWSUser(deployment.awsUser),
      region: deployment.awsRegion,
      command: `ecr get-login-password --region ${deployment.awsRegion}`,
      options: {
        silent: true,
      },
    })
  ).trim();

  exec(`docker login --username AWS --password ${ecrLoginPassword} ${repoUrl}`);

  let commitHash: string | undefined;
  try {
    commitHash = hash();
  } catch (e) {
    console.warn(`Cannot determine commit hash for tagging docker image: ${e}`);
  }

  if (!commitHash) {
    exec(`docker image tag ${config.configuration.imageTag} ${repoUrl}`);
    exec(`docker push ${repoUrl}`);
    deploymentState['latest'] = `${repoUrl}:latest`;
  } else {
    exec(
      `docker image tag ${config.configuration.imageTag}:${commitHash} ${repoUrl}:${commitHash}`,
    );
    exec(`docker image tag ${config.configuration.imageTag}:${commitHash} ${repoUrl}:latest`);
    exec(`docker push ${repoUrl}:${commitHash}`);
    exec(`docker push ${repoUrl}:latest`);
    deploymentState['latest'] = `${repoUrl}:${commitHash}`;
  }

  writeDeploymentState('./', deploymentState);
};

export const getDeploymentState = (
  deploymentName: string,

  deploymentsState: any,
): DeploymentState => {
  let state: DeploymentState;
  if (deploymentsState) {
    state = infraGetDeploymentState(validateDeploymentsState(deploymentsState), deploymentName);
  } else {
    state = readDeploymentState('./', deploymentName);
  }
  return state;
};

export const getRepo = (
  deploymentName: string,

  deploymentsState?: any,
): string => {
  const state = getDeploymentState(deploymentName, deploymentsState);
  return readTerraformStateVariable(state, 'repo_url');
};

export const infraAwsDockerImageCli = async (
  config: AWSDockerImagePackage,
  deployment: AWSDockerImageDeployment,
  args: string[],
): Promise<void> => {
  if (args.length < 1) {
    throw new Error(
      'Please provide the operation in the arguments: "up", "init", "plan", "apply", "deploy", "destroy", "upgrade", "terraform".',
    );
  }
  const [operation] = args;
  if (operation === 'deploy') {
    await deploy(config, deployment);
    return;
  }

  const infraOperation = args[0];
  const deploymentName = deployment.name;
  let targetVersion: string | undefined;
  let confirm: boolean | undefined;
  let commandArgs: string[] | undefined;

  if (infraOperation === 'upgrade') {
    targetVersion = args[1];
  } else if (infraOperation === 'terraform') {
    commandArgs = args.slice(1);
  } else if (infraOperation === 'destroy') {
    confirm = args.includes('-y');
  }

  await terraformAwsCli({
    infraOperation,
    deploymentName,
    targetVersion,
    confirm,
    command: commandArgs,
    ignoreMissingDeployments: false,
    skipConfirmations: false,
    options: undefined,
  });
};
