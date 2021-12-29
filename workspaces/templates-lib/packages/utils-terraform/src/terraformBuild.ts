import prompt from 'prompt-sync';
import { fatal } from '@goldstack/utils-log';
import { tf } from './terraformCli';
import {
  TerraformDeployment,
  TerraformVariables,
} from './types/utilsTerraformConfig';
import { CloudProvider } from './cloudProvider';
import { cd, read, pwd } from '@goldstack/utils-sh';
import { Variables } from './terraformCli';
import {
  readPackageConfig,
  writePackageConfig,
} from '@goldstack/utils-package';
import assert from 'assert';
import fs from 'fs';
import crypto from 'crypto';
import { writeDeploymentState, readDeploymentState } from '@goldstack/infra';

export const convertToPythonVariable = (variableName: string): string => {
  let res = '';

  for (const char of variableName) {
    if (char.toLowerCase() === char) {
      res += char;
    } else {
      res += '_' + char.toLowerCase();
    }
  }

  return res;
};

export const convertFromPythonVariable = (variableName: string): string => {
  let res = '';
  for (let i = 0; i < variableName.length; i++) {
    const char = variableName.charAt(i);
    if (i > 0 && variableName.charAt(i - 1) === '_') {
      res += variableName.charAt(i).toUpperCase();
    } else if (variableName.charAt(i) !== '_') {
      res += char;
    }
  }
  return res;
};

export const getVariablesFromProperties = (
  properties: object,
  terraformVariables?: TerraformVariables
): Variables => {
  const vars: Variables = [];
  if (!terraformVariables) {
    return vars;
  }
  for (const key in properties) {
    if (terraformVariables.find((varName) => varName === key)) {
      const variableName = convertToPythonVariable(key);
      const variableValue = properties[key];
      if (variableValue !== '') {
        vars.push([variableName, variableValue]);
      } else {
        console.log('using ', variableName.toLocaleUpperCase());
        vars.push([
          variableName,
          process.env[variableName.toLocaleUpperCase()] || '',
        ]);
      }
    }
  }

  return vars;
};

export const parseVariables = (hcl: string): string[] => {
  const reg = /variable[^"]*"([^"]*)"[^{]*{/gm;
  let result: RegExpExecArray | null;
  const variableNames: string[] = [];
  while ((result = reg.exec(hcl)) !== null) {
    variableNames.push(result[1]);
  }
  return variableNames;
};

export const getVariablesFromHCL = (properties: object): Variables => {
  if (!fs.existsSync('./variables.tf')) {
    console.warn(
      `No variables.tf file exists in ${pwd()}. Goldstack only supports declaring variables in a variables.tf file.`
    );
    return [];
  }
  const variablesHCL = read('./variables.tf');
  const hclVariableNames = parseVariables(variablesHCL);
  const jsVariableNames = hclVariableNames.map((hclVarName) =>
    convertFromPythonVariable(hclVarName)
  );

  jsVariableNames.forEach((key) => {
    if (!properties.hasOwnProperty(key)) {
      console.warn(
        `Cannot find property "${key}" in Goldstack configuration. Therefore terraform variable ${convertToPythonVariable(
          key
        )} will not be provided by Goldstack.`
      );
    }
  });

  const vars: Variables = [];
  for (const key in properties) {
    if (key.indexOf('_') !== -1) {
      console.warn(
        'Property in Goldstack configuration contains "_". This is not recommended. Property: ' +
          key +
          ' Please use valid JavaScript variable names. For instance, use "myVar" instead of "my_var". ' +
          ' Goldstack will automatically convert these to Terraform variables ("myVar" -> "my_var") when required.'
      );
    }
    if (jsVariableNames.find((varName) => varName === key)) {
      const variableName = convertToPythonVariable(key);
      const variableValue = properties[key];
      if (variableValue !== '') {
        if (typeof variableValue === 'string') {
          vars.push([variableName, variableValue]);
        } else if (typeof variableValue === 'number') {
          vars.push([variableName, `${variableValue}`]);
        } else if (typeof variableValue === 'object') {
          vars.push([
            variableName,
            `${JSON.stringify(variableValue).replace(/"/g, '\\"')}`,
          ]);
        } else {
          throw new Error(
            `Not supported type for variable ${variableName}: ${typeof variableValue}`
          );
        }
      } else {
        const environmentVarialbeName = variableName.toLocaleUpperCase();
        if (
          process.env[environmentVarialbeName] ||
          process.env[environmentVarialbeName] === ''
        ) {
          console.log('Setting terraform variable from environment variable');
          vars.push([variableName, process.env[environmentVarialbeName] || '']);
        } else {
          console.log('Terraform variable will not be defined', variableName);
        }
      }
    }
  }
  return vars;
};

const getDeployment = (args: string[]): TerraformDeployment => {
  if (args.length < 1) {
    throw new Error('Please specify the name of the deployment.');
  }
  const name = args[0];

  const packageConfig = readPackageConfig();

  const deployment = packageConfig.deployments.find(
    (deployment) => deployment.name === name
  );

  if (!deployment) {
    fatal(`Cannot find configuration for deployment '${name}''`);
    throw new Error('Cannot parse configuration.');
  }

  return deployment;
};

export class TerraformBuild {
  provider: CloudProvider;

  getTfStateVariables = (
    deployment: TerraformDeployment
  ): [string, string][] => {
    const packageConfig = readPackageConfig();
    const deployments = packageConfig.deployments.filter(
      (d) => d.name === deployment.name
    );
    if (deployments.length !== 1) {
      throw new Error(`Cannot find deployment ${deployment.name}`);
    }
    const deploymentConfig = deployments[0];

    // initialise id for key if required
    if (!(deploymentConfig as TerraformDeployment).tfStateKey) {
      const stateHash = crypto.randomBytes(10).toString('hex');
      const stateKey = `${packageConfig.name}-${deployment.name}-${stateHash}.tfstate`;
      console.log(
        `Intialising Terraform State key for ${deployment.name} to ${stateKey}`
      );
      (deploymentConfig as TerraformDeployment).tfStateKey = stateKey;
      writePackageConfig(packageConfig);
    }

    return this.provider.getTfStateVariables(deploymentConfig);
  };
  init = (args: string[]): void => {
    const deployment = getDeployment(args);
    const backendConfig = this.getTfStateVariables(deployment);
    cd('./infra/aws');
    const provider = this.provider;
    tf('init', {
      provider,
      backendConfig,
      options: ['-force-copy', '-reconfigure'],
    });
    const workspaces = tf('workspace list', { provider });

    const deploymentName = args[0];
    const workspaceExists = workspaces.split('\n').find((line) => {
      return line.indexOf(deploymentName) >= 0;
    });
    if (!workspaceExists) {
      tf(`workspace new ${deploymentName}`, {
        provider,
      });
      tf(`workspace select ${deploymentName}`, { provider });
    }

    cd('../..');
  };

  plan = (args: string[]): void => {
    const deployment = getDeployment(args);
    const backendConfig = this.getTfStateVariables(deployment);
    cd('./infra/aws');
    const provider = this.provider;

    const variables = [
      ...getVariablesFromHCL({ ...deployment, ...deployment.configuration }),
    ];

    const currentWorkspace = tf('workspace show', { provider }).trim();
    if (currentWorkspace !== args[0]) {
      // init with reconfigure required here in case we are switching to a different
      // s3 bucket in a different environment for a different deployment
      tf('init', { provider, backendConfig, options: ['-reconfigure'] });
      tf(`workspace select ${args[0]}`, { provider });
    }
    tf('plan', {
      provider,
      variables,
      options: ['-input=false', '-out tfplan'],
    });

    cd('../..');
  };

  apply = (args: string[]): void => {
    const deployment = getDeployment(args);
    const backendConfig = this.getTfStateVariables(deployment);
    cd('./infra/aws');
    const provider = this.provider;
    const deploymentName = args[0];
    const currentWorkspace = tf('workspace show', { provider }).trim();
    if (currentWorkspace !== deploymentName) {
      // init with reconfigure required here in case we are switching to a different
      // s3 bucket in a different environment for a different deployment
      tf('init', { provider, backendConfig, options: ['-reconfigure'] });
      tf(`workspace select ${deploymentName}`, { provider });
    }
    tf('apply', {
      provider,
      options: ['-input=false', 'tfplan'],
    });

    const res = tf('output', { provider, options: ['-json'] }).trim();

    const deploymentState = readDeploymentState('./../../', deploymentName, {
      createIfNotExist: true,
    });
    deploymentState.terraform = JSON.parse(res);
    writeDeploymentState('./../../', deploymentState);

    cd('../..');
  };

  destroy = (args: string[]): void => {
    const deployment = getDeployment(args);
    const backendConfig = this.getTfStateVariables(deployment);
    cd('./infra/aws');
    const ciConfirmed = args.find((str) => str === '-y');
    if (!ciConfirmed) {
      const value = prompt()(
        'Are you sure to destroy your deployed resources? If yes, please type `y` and enter.\n' +
          'Otherwise, press enter.\nYour Input: '
      );
      if (value !== 'y') {
        fatal('Prompt not confirmed with `y`');
      }
    }
    const provider = this.provider;
    const variables = [
      ...getVariablesFromHCL({ ...deployment, ...deployment.configuration }),
    ];

    tf('init', { provider, backendConfig, options: ['-reconfigure'] });
    tf(`workspace select ${args[0]}`, { provider });
    tf('plan', {
      provider,
      variables,
      options: ['-input=false', '-out tfplan'],
    });
    tf('destroy', {
      provider,
      variables,
      options: ['-input=false', '-auto-approve'],
    });

    cd('../..');
  };

  constructor(provider: CloudProvider) {
    assert(provider);
    this.provider = provider;
  }
}
