data "archive_file" "empty_lambda" {
  type        = "zip"
  output_path = "${path.module}/empty_lambda.zip"

  source {
    content  = "exports.handler = function() { };"
    filename = "lambda.js"
  }
}

resource "aws_cloudwatch_log_group" "main" {
  name              = "/aws/lambda/${var.lambda_name}"
  retention_in_days = 30
}

resource "aws_lambda_function" "main" {
  function_name = var.lambda_name

  filename = data.archive_file.empty_lambda.output_path

  handler = "bootstrap"
  runtime = "provided.al2"

  memory_size = 2048
  timeout     = 900

  role = module.lambda_execution_role.role_arn

  lifecycle {
    create_before_destroy = true
    ignore_changes = [
      filename,
    ]
  }

  environment {
    variables = {
      GOLDSTACK_DEPLOYMENT = var.name
      CORS                 = var.cors
    }
  }

  logging_config {
    log_format = "Text"
    log_group  = aws_cloudwatch_log_group.main.name
  }
}

module "lambda_execution_role" {
  source = "../../../../infra/aws/shared/lambda-execution-role"

  role_name = "${var.lambda_name}-role"
}

moved {
  from = aws_iam_role.lambda_exec
  to   = module.lambda_execution_role.aws_iam_role.this
}
