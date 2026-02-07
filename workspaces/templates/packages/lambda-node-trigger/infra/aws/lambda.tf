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

  reserved_concurrent_executions = 10 # this is a failsafe in case things go very wrong and prevent us from creating high AWS costs.
  # if you need higher concurrency, please alter

  handler = "lambda.handler"
  runtime = "nodejs22.x"

  memory_size = 512
  timeout     = 900

  role = aws_iam_role.lambda_exec.arn

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


resource "aws_iam_role" "lambda_exec" {
  name = "${var.lambda_name}-role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF

}

resource "aws_iam_role_policy_attachment" "lambda_admin_role_attach" {
  role = aws_iam_role.lambda_exec.name
  # Gives this lambda full access to everything. Consider restricting rules to only the resources this lambda will require.
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

