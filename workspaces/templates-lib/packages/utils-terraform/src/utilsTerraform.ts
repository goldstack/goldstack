export type {
  TerraformDeployment,
  TerraformVariable,
  TerraformVariables,
} from './types/utilsTerraformConfig';

import { CloudProvider } from './cloudProvider';

export type { CloudProvider } from './cloudProvider';

import { TerraformBuild } from './terraformBuild';

export { tf } from './terraformCli';
export { getVariablesFromProperties } from './terraformBuild';

import { Argv } from 'yargs';

export const infraCommands = (): any => {
  const deploymentPositional = (yargs: Argv<any>): Argv<any> => {
    return yargs.positional('deployment', {
      type: 'string',
      describe: 'Name of the deployment this command should be applied to',
      demandOption: true,
    });
  };
  return (yargs: Argv<any>): Argv<any> => {
    return yargs
      .command(
        'up <deployment>',
        'Stands up infrastructure for the specified deployment',
        deploymentPositional
      )
      .command(
        'init <deployment>',
        'Initialises Terraform working directory for deployment',
        deploymentPositional
      )
      .command(
        'plan <deployment>',
        'Creates a Terraform execution plan for deployment',
        deploymentPositional
      )
      .command(
        'apply <deployment>',
        'Applies the last Terraform execution plan calculated using `infra plan`',
        deploymentPositional
      )
      .command(
        'destroy <deployment>',
        'DANGER: Destroys all deployed infrastructure for the deployment',
        (yargs) => {
          return deploymentPositional(yargs).option('yes', {
            alias: 'y',
            description:
              'DANGER: If provided, confirmation for deleting infrastructure resources will be skipped.',
            default: false,
            demandOption: false,
            type: 'boolean',
          });
        }
      )
      .command(
        'upgrade <deployment> <targetVersion>',
        'Upgrades Terraform version to a new target version (experimental)',
        (yargs) => {
          return deploymentPositional(yargs).positional('targetVersion', {
            type: 'string',
            description:
              'Provides the target Terraform version that should be migrated to.',
            demandOption: true,
          });
        }
      );
  };
};

export const terraformCli = (
  args: string[],
  options: { provider: CloudProvider }
): void => {
  const [operation, ...opArgs] = args;

  const build = new TerraformBuild(options.provider);

  if (operation === 'up') {
    build.init(opArgs);
    build.plan(opArgs);
    build.apply(opArgs);
    return;
  }

  if (operation === 'init') {
    build.init(opArgs);
    return;
  }
  if (operation === 'plan') {
    build.plan(opArgs);
    return;
  }
  if (operation === 'apply') {
    build.apply(opArgs);
    return;
  }

  if (operation === 'destroy') {
    build.destroy(opArgs);
    return;
  }

  if (operation === 'upgrade') {
    build.upgrade(opArgs);
    return;
  }

  throw new Error('Unknown infrastructure operation: ' + operation);
};
