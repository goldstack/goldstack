data "archive_file" "empty_lambda" {
  type        = "zip"
  output_path = "${path.module}/empty_lambda.zip"

  source {
    content  = "exports.handler = function() { };"
    filename = "lambda.js"
  }
}

resource "aws_lambda_function" "main" {

  function_name = var.lambda_name

  filename = data.archive_file.empty_lambda.output_path

  handler = "lambda.handler"
  runtime = "nodejs22.x"

  memory_size = 512
  timeout     = 900

  role = module.lambda_execution_role.role_arn

  logging_config {
    log_format = "Text"
    log_group  = aws_cloudwatch_log_group.lambda_log_group.name
  }

  lifecycle {
    create_before_destroy = true
    ignore_changes = [
      filename,
    ]
  }

  environment {
    variables = {
      GOLDSTACK_DEPLOYMENT = var.name
    }
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
