import { AWSDeploymentRegion } from './awsDeployment';

export type AWSUsers = AWSUser[];

/**
 * Identifier for this user. No spaces allowed.
 *
 * @title Name
 * @pattern ^[^\s]*$
 */
export type Name = string;

/**
 * Type of this user.
 *
 * @title Type
 */
export type Type = 'apiKey' | 'local' | 'environmentVariables';

/**
 * Profile name of the user configured with the aws cli. When in doubt, use `default`.
 *
 * @title Profile
 * @pattern ^[^\s]*$
 */
export type Profile = string;

/**
 * Name of environment variable for AWS Access Key Id. When in doubt, use AWS_ACCESS_KEY_ID.
 *
 * @title AWS Access Key Id Variable Name
 * @pattern ^[^\s]*$
 */
export type AWSAccessKeyIdVariableName = string;
/**
 * Name of environment variable for AWS Secret Access Key. When in doubt, use AWS_SECRET_ACCESS_KEY.
 *
 * @title AWS Secret Access Key Variable Name
 * @pattern ^[^\s]*$
 */
export type AWSSecretAccessKeyVariableName = string;

/**
 * Name of environment variable for AWS Default Region. When in doubt, use AWS_DEFAULT_REGION.
 *
 * @title AWS Default Region Varialbe Name
 * @pattern ^[^\s]*$
 */
export type AWSDefaultRegionVariableName = string;

/**
 * Access key for this user.
 *
 * @title AWS Access Key Id
 * @pattern ^[^\s]*$
 */
export type AWSAccessKeyId = string;

/**
 * Secret key for this user.
 *
 * @title AWS Secret Access Key
 * @pattern ^[^\s]*$
 */
export type AWSSecretAccessKey = string;

/**
 * Default AWS region to use.
 *
 * @title AWS Region
 * @pattern ^[^\s]*$
 */
export type AWSRegion = AWSDeploymentRegion;

/**
 * The name of the bucket where the Terraform state for the packages will be stored.
 * If not provided, will be auto-generated on first deployment.
 *
 * @title Terraform State Bucket
 * @pattern ^[^\s]*$
 */
export type TerraformStateBucket = string;

/**
 * The name of the DynamoDB table used for Terraform state locking. If not provided, will be auto-generated on first deployment.
 *
 * @title Terraform DynamoDB Table
 * @pattern ^[^\s]*$
 */
export type TerraformDynamoDBTable = string;

/**
 * User that is configured using the aws cli. Useful for development environments.
 *
 * @title AWS Local User Configuration
 */
export interface AWSLocalUserConfig {
  profile: Profile;
}

/**
 * Obtain AWS user from environment variables. This will be useful for CI/CD.
 *
 * @title AWS Environment Variable User Configuration
 */
export interface AWSEnvironmentVariableUserConfig {
  awsAccessKeyIdVariableName: AWSAccessKeyIdVariableName;
  awsSecretAccessKeyVariableName: AWSSecretAccessKeyVariableName;
  awsDefaultRegionVariableName: AWSDefaultRegionVariableName;
}
/**
 * User accessing AWS using an access key id and secret access key. Only recommended for users used during development. The provided credentials will be included in the downloaded package but by default will not be committed to git.
 *
 * @title AWS API Key User Configuration
 */
export interface AWSAPIKeyUserConfig {
  awsAccessKeyId?: AWSAccessKeyId;
  awsSecretAccessKey?: AWSSecretAccessKey;
  awsDefaultRegion: AWSRegion;
}

export interface TerraformConfig {
  terraformStateBucket?: TerraformStateBucket;
  terraformStateDynamoDBTable?: TerraformDynamoDBTable;
}

export type AwsUserConfig = (
  | AWSLocalUserConfig
  | AWSEnvironmentVariableUserConfig
  | AWSAPIKeyUserConfig
) &
  TerraformConfig;

/**
 * AWS user
 *
 * @title AWS User
 */
export interface AWSUser {
  name: Name;
  type: Type;
  config: AwsUserConfig;
}

/**
 * Global configuration for deploying to AWS.
 *
 * @title AWS Configuration
 */
export interface AWSConfiguration {
  users: AWSUsers;
}
