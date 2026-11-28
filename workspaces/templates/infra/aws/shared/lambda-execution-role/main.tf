# Shared execution role for Goldstack Lambda functions.
#
# The policy below deliberately grants broad access to the AWS services that
# Goldstack templates commonly create (S3, DynamoDB, Cognito, SQS, SNS, SES,
# CloudWatch and related services). This keeps generated projects working out of
# the box while still keeping the role separate from full administrator access.
# Users can tighten the policy for their application once they know which
# resources their Lambda functions actually need.

data "aws_iam_policy_document" "lambda_permissions" {
  statement {
    sid = "CloudWatchLogs"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:DescribeLogStreams",
      "logs:DescribeLogGroups",
      "logs:FilterLogEvents",
      "logs:GetLogEvents",
      "logs:PutRetentionPolicy",
      "logs:DeleteRetentionPolicy",
      "logs:TagResource",
      "logs:UntagResource",
    ]
    resources = ["*"]
  }

  statement {
    sid       = "S3"
    actions   = ["s3:*"]
    resources = ["*"]
  }

  statement {
    sid       = "DynamoDB"
    actions   = ["dynamodb:*"]
    resources = ["*"]
  }

  statement {
    sid = "Cognito"
    actions = [
      "cognito-idp:*",
      "cognito-identity:*",
    ]
    resources = ["*"]
  }

  statement {
    sid       = "SQS"
    actions   = ["sqs:*"]
    resources = ["*"]
  }

  statement {
    sid       = "SNS"
    actions   = ["sns:*"]
    resources = ["*"]
  }

  statement {
    sid       = "SES"
    actions   = ["ses:*"]
    resources = ["*"]
  }

  statement {
    sid = "CloudWatchMetrics"
    actions = [
      "cloudwatch:PutMetricData",
      "cloudwatch:GetMetricData",
      "cloudwatch:GetMetricStatistics",
      "cloudwatch:ListMetrics",
    ]
    resources = ["*"]
  }

  statement {
    sid = "EventBridge"
    actions = [
      "events:PutEvents",
      "events:PutRule",
      "events:PutTargets",
      "events:DeleteRule",
      "events:RemoveTargets",
      "events:DescribeRule",
      "events:ListRules",
    ]
    resources = ["*"]
  }

  statement {
    sid       = "SecretsManager"
    actions   = ["secretsmanager:*"]
    resources = ["*"]
  }

  statement {
    sid = "SystemsManagerParameters"
    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:GetParametersByPath",
      "ssm:DescribeParameters",
      "ssm:PutParameter",
      "ssm:DeleteParameter",
    ]
    resources = ["*"]
  }

  statement {
    sid = "KMS"
    actions = [
      "kms:Decrypt",
      "kms:Encrypt",
      "kms:GenerateDataKey",
      "kms:GenerateDataKeyWithoutPlaintext",
      "kms:DescribeKey",
    ]
    resources = ["*"]
  }

  statement {
    sid = "LambdaInvoke"
    actions = [
      "lambda:InvokeFunction",
      "lambda:InvokeAsync",
    ]
    resources = ["*"]
  }

  statement {
    sid = "CloudFrontInvalidation"
    actions = [
      "cloudfront:CreateInvalidation",
      "cloudfront:GetInvalidation",
      "cloudfront:ListInvalidations",
    ]
    resources = ["*"]
  }

  statement {
    sid = "XRay"
    actions = [
      "xray:PutTraceSegments",
      "xray:PutTelemetryRecords",
      "xray:GetSamplingRules",
      "xray:GetSamplingTargets",
    ]
    resources = ["*"]
  }

  statement {
    sid       = "ExecuteApi"
    actions   = ["execute-api:Invoke"]
    resources = ["*"]
  }

  statement {
    sid       = "STS"
    actions   = ["sts:GetCallerIdentity"]
    resources = ["*"]
  }
}

resource "aws_iam_role" "this" {
  name                  = var.role_name
  description           = var.description
  permissions_boundary  = var.permissions_boundary
  force_detach_policies = true

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

  tags = var.tags
}

resource "aws_iam_policy" "this" {
  name        = var.policy_name != "" ? var.policy_name : "${var.role_name}-policy"
  description = "Broad access to AWS resources commonly used by Goldstack Lambda functions."
  policy      = data.aws_iam_policy_document.lambda_permissions.json

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "this" {
  role       = aws_iam_role.this.name
  policy_arn = aws_iam_policy.this.arn
}

resource "aws_iam_role_policy_attachment" "additional" {
  for_each = toset(var.additional_policy_arns)

  role       = aws_iam_role.this.name
  policy_arn = each.value
}
