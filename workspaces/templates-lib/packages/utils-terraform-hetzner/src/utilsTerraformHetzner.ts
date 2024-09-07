import {
  terraformCli,
  CloudProvider,
  TerraformDeployment,
  TerraformOptions,
} from '@goldstack/utils-terraform';
import {
  getHetznerUser,
  readDeploymentFromPackageConfig,
} from '@goldstack/infra-hetzner';
import { AWSCloudProvider } from '@goldstack/utils-terraform-aws';

export class HetznerCloudProvider implements CloudProvider {
  token: string;
  awsProvider: AWSCloudProvider;

  generateEnvVariableString = (): string => {
    return (
      `-e TF_VAR_hcloud_token=${this.token} ` +
      this.awsProvider.generateEnvVariableString()
    );
  };

  setEnvVariables = (): void => {
    process.env.TF_VAR_hcloud_token = this.token;
    this.awsProvider.setEnvVariables();
  };

  getTfStateVariables = (
    deployment: TerraformDeployment
  ): [string, string][] => {
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
  options?: TerraformOptions
): Promise<void> => {
  const deploymentName = args[1];

  const deployment = readDeploymentFromPackageConfig(deploymentName);

  const user = await getHetznerUser(deployment.hetznerUser);

  terraformCli(args, {
    ...options,
    provider: new HetznerCloudProvider(user.config.token, provider),
  });
};
