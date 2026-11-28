# Lambda Execution Role

Shared local Terraform module that creates the IAM execution role used by
Goldstack Lambda functions (scheduled jobs, APIs, server-side rendering and
Cognito triggers).

The role is intentionally permissive by default. It grants access to the AWS
services that Goldstack templates commonly create and use:

- S3 (full access to all buckets and objects)
- DynamoDB (full access, including table and index management)
- Cognito User Pools and Identity Pools
- SQS, SNS and SES
- CloudWatch Logs, metrics and alarms
- EventBridge schedules and events
- Secrets Manager and Systems Manager Parameter Store
- KMS, CloudFront invalidation, X-Ray, Lambda invocation and `execute-api`

This keeps generated projects working without every template having to model
its Lambda permissions up front. For production workloads, replace the broad
statements in `main.tf` with policies scoped to the resources the function
actually uses, or attach a permissions boundary.

## Usage

From a package's `infra/aws` directory, reference the module in the monorepo
root (four levels up):

```hcl
module "lambda_execution_role" {
  source = "../../../../infra/aws/shared/lambda-execution-role"

  role_name = "${var.lambda_name}-role"
}
```

Then use `module.lambda_execution_role.role_arn` as the `role` for the Lambda
function.

## Inputs

| Name | Description | Default |
| --- | --- | --- |
| `role_name` | Name of the IAM execution role. | required |
| `description` | Description of the IAM role. | `Execution role for Goldstack Lambda functions.` |
| `policy_name` | Name of the managed policy. | `<role_name>-policy` |
| `additional_policy_arns` | Additional managed policies to attach. | `[]` |
| `permissions_boundary` | Optional permissions boundary ARN. | `null` |
| `tags` | Tags applied to the role and policy. | `{}` |

## Outputs

| Name | Description |
| --- | --- |
| `role_arn` | ARN of the execution role. |
| `role_name` | Name of the execution role. |
| `policy_arn` | ARN of the broad access policy. |
