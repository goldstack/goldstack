import configSchema from './schemas/configSchema.json';
import { terraformAwsCli } from '@goldstack/utils-terraform-aws';

import {
  AWSDockerImagePackage,
  AWSDockerImageDeployment,
} from './types/AWSDockerImagePackage';
import { exec } from '@goldstack/utils-sh';
import { hash } from '@goldstack/utils-git';
import { assertDocker } from '@goldstack/utils-docker';
import { awsCli } from '@goldstack/utils-aws-cli';
import { getAWSUser } from '@goldstack/infra-aws';
import {
  readDeploymentState,
  writeDeploymentState,
  readTerraformStateVariable,
  DeploymentState,
  validateDeploymentsState,
  getDeploymentState as infraGetDeploymentState,
} from '@goldstack/infra';

export const getConfigSchema = (): object => configSchema;

export const deploy = async (
  config: AWSDockerImagePackage,
  deployment: AWSDockerImageDeployment
): Promise<void> => {
  const deploymentState = readDeploymentState('./', deployment.name, {
    createIfNotExist: true,
  });
  const repoUrl = readTerraformStateVariable(deploymentState, 'repo_url');
  assertDocker();

  const ecrLoginPassword = awsCli({
    credentials: await getAWSUser(deployment.awsUser),
    region: deployment.awsRegion,
    command: `ecr get-login-password --region ${deployment.awsRegion}`,
    options: {
      silent: true,
    },
  }).trim();

  exec(`docker login --username AWS --password ${ecrLoginPassword} ${repoUrl}`);

  let commitHash: string | undefined = undefined;
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
      `docker image tag ${config.configuration.imageTag}:${commitHash} ${repoUrl}:${commitHash}`
    );
    exec(
      `docker image tag ${config.configuration.imageTag}:${commitHash} ${repoUrl}:latest`
    );
    exec(`docker push ${repoUrl}:${commitHash}`);
    exec(`docker push ${repoUrl}:latest`);
    deploymentState['latest'] = `${repoUrl}:${commitHash}`;
  }

  writeDeploymentState('./', deploymentState);
};

export const getDeploymentState = (
  deploymentName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deploymentsState: any
): DeploymentState => {
  let state: DeploymentState;
  if (deploymentsState) {
    state = infraGetDeploymentState(
      validateDeploymentsState(deploymentsState),
      deploymentName
    );
  } else {
    state = readDeploymentState('./', deploymentName);
  }
  return state;
};

export const getRepo = (
  deploymentName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deploymentsState?: any
): string => {
  const state = getDeploymentState(deploymentName, deploymentsState);
  return readTerraformStateVariable(state, 'repo_url');
};

export const infraAwsDockerImageCli = async (
  config: AWSDockerImagePackage,
  deployment: AWSDockerImageDeployment,
  args: string[]
): Promise<void> => {
  if (args.length < 1) {
    throw new Error(
      'Please provide the operation in the arguments: "init", "plan", "apply", "deploy", "destroy".'
    );
  }
  const [operation] = args;
  if (operation === 'deploy') {
    await deploy(config, deployment);
    return;
  }

  await terraformAwsCli(args);
};
