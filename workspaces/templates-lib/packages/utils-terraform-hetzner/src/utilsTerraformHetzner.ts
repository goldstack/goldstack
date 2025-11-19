import { getHetznerUser, readDeploymentFromPackageConfig } from '@goldstack/infra-hetzner';
import {
  type CloudProvider,
  type TerraformDeployment,
  type TerraformOptions,
  terraformCli,
} from '@goldstack/utils-terraform';
import type { AWSCloudProvider } from '@goldstack/utils-terraform-aws';

export class HetznerCloudProvider implements CloudProvider {
  token: string;
  awsProvider: AWSCloudProvider;

  generateEnvVariableString = (): string => {
    return `-e TF_VAR_hcloud_token=${this.token} ` + this.awsProvider.generateEnvVariableString();
  };

  setEnvVariables = (): void => {
    process.env.TF_VAR_hcloud_token = this.token;
    this.awsProvider.setEnvVariables();
  };

  getTfStateVariables = (deployment: TerraformDeployment): [string, string][] => {
    return this.awsProvider.getTfStateVariables(deployment);
  };

  constructor(token: string, awsProvider: AWSCloudProvider) {
    this.token = token;
    this.awsProvider = awsProvider;
  }
}

export const terraformHetznerCli = async (
  args: string[],
  provider: AWSCloudProvider,
  options?: TerraformOptions,
): Promise<void> => {
  const ignoreMissingDeployments = args.includes('--ignore-missing-deployments');
  const deploymentName = args[1];

  const deployment = readDeploymentFromPackageConfig(
    deploymentName,
    undefined,
    ignoreMissingDeployments,
  );

  if (!deployment && ignoreMissingDeployments) {
    // Deployment doesn't exist and we're ignoring missing deployments
    console.warn(`Warning: Deployment '${deploymentName}' does not exist. Skipping operation.`);
    return;
  }

  if (!deployment) {
    throw new Error('Cannot find deployment: ' + deploymentName);
  }

  const user = await getHetznerUser(deployment.hetznerUser);

  terraformCli(args, {
    ...options,
    provider: new HetznerCloudProvider(user.config.token, provider),
  });
};
