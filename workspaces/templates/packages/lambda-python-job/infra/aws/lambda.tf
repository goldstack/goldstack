data "archive_file" "empty_lambda" {
  type        = "zip"
  output_path = "${path.module}/empty_lambda.zip"

  source {
    content  = "def handler(event, context):\n  return {\n    'statusCode': '200',\n    'body': 'lambda not defined'\n  }\n"
    filename = "lambda.py"
  }
}

resource "aws_cloudwatch_log_group" "main" {
  name              = "/aws/lambda/${var.lambda_name}"
  retention_in_days = 30
}

resource "aws_lambda_function" "main" {
  function_name = var.lambda_name

  filename = data.archive_file.empty_lambda.output_path

  handler = "lambda.handler"
  runtime = "python3.12"

  memory_size = 2048
  timeout     = 900

  role = module.lambda_execution_role.role_arn

  lifecycle {
    ignore_changes = [
      filename,
    ]
  }

  environment {
    variables = {
      GOLDSTACK_DEPLOYMENT = var.name
    }
  }

  logging_config {
    log_format = "Text"
    log_group  = aws_cloudwatch_log_group.main.name
  }

  # Configure Dead-letter Queue for Lambda errors if DLQ is created
  dynamic "dead_letter_config" {
    for_each = length(aws_sqs_queue.dlq) > 0 ? [1] : []
    content {
      target_arn = aws_sqs_queue.dlq[0].arn
    }
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
