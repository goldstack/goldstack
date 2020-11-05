Here are a number of ways how the configuration for this module can be changed to enhance security:

- In `infra/aws/edge.tf` for the `resource "aws_iam_policy" "lambda_logging"` you can further restrict the access rights to write log events: `"Resource": "arn:aws:logs:*:*:*"`.
