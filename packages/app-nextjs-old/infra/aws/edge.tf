resource "aws_iam_role" "lambda_exec" {
  name               = "${var.website_domain}-edge"
  assume_role_policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service": [
            "lambda.amazonaws.com",
            "edgelambda.amazonaws.com"
          ]
        },
        "Effect": "Allow",
        "Sid": ""
      }
    ]
  }
  EOF

}

data "archive_file" "empty_lambda" {
  type = "zip"
  output_path = "${path.module}/empty_lambda.zip"

  source {
    content = "exports.handler = function() { };"
    filename = "lambda.js"
  }
}

resource "aws_lambda_function" "edge" {
  provider         = aws.us-east-1
  function_name    =  "${replace(var.website_domain, ".", "-")}-edge"
  description      = "Edge Lambda for CloudFront Routing"
  filename         = data.archive_file.empty_lambda.output_path
  handler          = "lambda.handler"
  runtime          = "nodejs12.x"
  role             = aws_iam_role.lambda_exec.arn
  timeout          = 30
  memory_size      = 512
  publish          = true
  lifecycle {
    ignore_changes = [
       filename,
    ]
  }
}



# Explicit roles to allow logging for Lambda. Not strictly required here due to the full admin access
# granted in the lambda_admin_role_attach above. But added here to make it easier to fine-tune permissions
# in the above at a later point. 
resource "aws_iam_policy" "lambda_logging" {
  name        = "${var.website_domain}-edge-lambda-logging-role"
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

resource "aws_iam_role_policy_attachment" "edge_lambda_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_logging.arn
}