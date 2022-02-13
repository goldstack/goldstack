# Shared config for all lambdas in the API

resource "aws_iam_role" "lambda_exec" {
  name = "lambda-api-role-${random_id.id.hex}"

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
  name        = "lambda-api-logging-role-${random_id.id.hex}"
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

