Here are a number of ways how the configuration for this module can be changed to enhance security:

- When deploying with Lambda@Edge routing, you can further restrict the access rights to write log events for the `resource "aws_iam_policy" "lambda_logging"` in `infra/aws/edge.tf`: `"Resource": "arn:aws:logs:*:*:*"`.
- CloudFront Functions run in a restricted sandbox without access to IAM roles or network resources, so the default CloudFront Functions deployment does not create the Lambda@Edge logging policy.
