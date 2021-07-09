import { Name } from './awsAccount';

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

export interface RemoteState {
  user: Name;
  terraformStateBucket?: TerraformStateBucket;
  terraformStateDynamoDBTable?: TerraformDynamoDBTable;
}

export interface AWSTerraformState {
  remoteState: RemoteState[];
}
