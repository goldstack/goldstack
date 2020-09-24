import {
  DeploymentsState,
  DeploymentState,
} from './types/deploymentStatesTypes';
import { write, read } from '@goldstack/utils-sh';
import { validateConfig } from '@goldstack/utils-config';
import fs from 'fs';
import deploymentsStateSchema from './schemas/deploymentsStateSchema.json';
import path from 'path';

const deploymentsStatePath = 'src/state/deployments.json';

export const validateDeploymentsState = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deploymentsState: any
): DeploymentsState => {
  return validateConfig(deploymentsState, deploymentsStateSchema, {
    errorMessage: 'Cannot validate deployments state.',
  }) as DeploymentsState;
};

export const hasDeploymentsState = (packageDir: string): boolean => {
  return fs.existsSync(packageDir + deploymentsStatePath);
};

export interface ReadDeploymentsStateOptions {
  createIfNotExist: boolean;
}

export const readDeploymentsState = (
  packageDir: string,
  options?: ReadDeploymentsStateOptions
): DeploymentsState => {
  if (!hasDeploymentsState(packageDir)) {
    if (options && options.createIfNotExist) {
      return [];
    }

    throw new Error(
      `Deployments state does not exist in ${path.resolve(
        packageDir + deploymentsStatePath
      )}. Have you deployed this package yet?`
    );
  }

  const data = JSON.parse(read(packageDir + deploymentsStatePath));
  return validateDeploymentsState(data);
};

export const getDeploymentState = (
  deploymentsState: DeploymentsState,
  deploymentName: string,
  options?: ReadDeploymentsStateOptions
): DeploymentState => {
  const deploymentState = deploymentsState.find(
    (deploymentState) => deploymentState.name === deploymentName
  );
  if (!deploymentState) {
    if (options && options.createIfNotExist) {
      return {
        name: deploymentName,
      };
    }
    throw new Error(
      `Deployment state not defined for deployment '${deploymentName}'. Did you already deploy this deployment?`
    );
  }
  return deploymentState;
};

export const readDeploymentState = (
  packageDir: string,
  deploymentName: string,
  options?: ReadDeploymentsStateOptions
): DeploymentState => {
  const deploymentsState = readDeploymentsState(packageDir, options);

  return getDeploymentState(deploymentsState, deploymentName, options);
};

export const writeDeploymentsState = (
  packageDir: string,
  deploymentsState: DeploymentsState
): void => {
  write(
    JSON.stringify(deploymentsState, null, 2),
    packageDir + deploymentsStatePath
  );
};

export const writeDeploymentState = (
  packageDir: string,
  deploymentState: DeploymentState
): void => {
  let deploymentsState: DeploymentsState;
  if (hasDeploymentsState(packageDir)) {
    deploymentsState = readDeploymentsState(packageDir);
  } else {
    deploymentsState = [];
  }
  const idx = deploymentsState.findIndex(
    (deployment) => deployment.name === deploymentState.name
  );
  if (idx === -1) {
    deploymentsState.push(deploymentState);
  } else {
    deploymentsState[idx] = deploymentState;
  }
  writeDeploymentsState(packageDir, deploymentsState);
};

export const readTerraformStateVariable = (
  deploymentState: DeploymentState,
  variableName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  if (!deploymentState.terraform) {
    throw new Error(
      `Terraform configuration not defined in deployment state for ${deploymentState.name}. Has this package been deployed?`
    );
  }
  const tfVar = deploymentState.terraform[variableName];
  if (!tfVar) {
    throw new Error(
      `Terraform variable '${variableName}' not defined in deployment state.`
    );
  }
  return tfVar.value;
};
