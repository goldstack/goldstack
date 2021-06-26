
data "archive_file" "empty_lambda" {
  type = "zip"
  output_path = "${path.module}/empty_lambda.zip"

  source {
    content = "exports.handler = function() { };"
    filename = "lambda.js"
  }
}

resource "aws_lambda_function" "main" {
  function_name = var.lambda_name

  filename = data.archive_file.empty_lambda.output_path

  handler = "lambda.handler"
  runtime = "nodejs12.x"

  memory_size = 2048
  timeout = 900

  role = aws_iam_role.lambda_exec.arn

  lifecycle {
    ignore_changes = [
       filename,
    ]
  }

  environment {
    variables = {
      GOLDSTACK_DEPLOYMENT = var.name
      CORS = var.cors
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
  role       = aws_iam_role.lambda_exec.name
  # Gives this lambda full access to everything. Consider restricting rules to only the resources this lambda will require.
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

# Explicit roles to allow logging for Lambda. Not strictly required here due to the full admin access
# granted in the lambda_admin_role_attach above. But added here to make it easier to fine-tune permissions
# in the above at a later point. 
resource "aws_iam_policy" "lambda_logging" {
  name        = "${var.lambda_name}-lambda-logging-role"
  path        = "/"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_logging.arn
}