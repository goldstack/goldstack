# Shared execution role for all lambdas in the API

module "lambda_execution_role" {
  source = "../../../../infra/aws/shared/lambda-execution-role"

  role_name = "lambda-api-role-${random_id.id.hex}"
}

moved {
  from = aws_iam_role.lambda_exec
  to   = module.lambda_execution_role.aws_iam_role.this
}
