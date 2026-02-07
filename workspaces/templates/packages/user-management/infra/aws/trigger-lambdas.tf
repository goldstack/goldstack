data "archive_file" "no_op_lambda" {
  type        = "zip"
  output_path = "${path.module}/no_op_lambda.zip"

  source {
    content  = "exports.handler = async function(event) { return event; };"
    filename = "lambda.js"
  }
}

resource "aws_lambda_function" "pre_sign_up" {

  function_name = "${var.user_pool_name}-pre-sign-up"

  filename = data.archive_file.no_op_lambda.output_path

  handler = "lambda.handler"
  runtime = "nodejs22.x"

  memory_size = 512
  timeout     = 30

  role = aws_iam_role.lambda_exec.arn

  tags = {
    Name        = "${var.user_pool_name}-pre-sign-up"
    Environment = var.name
  }

  logging_config {
    log_format = "Text"
    log_group  = aws_cloudwatch_log_group.pre_sign_up.name
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


}

resource "aws_cloudwatch_log_group" "pre_sign_up" {
  name              = "/aws/lambda/${var.user_pool_name}-pre-sign-up"
  retention_in_days = 14
}

resource "aws_lambda_function" "post_confirmation" {

  function_name = "${var.user_pool_name}-post-confirmation"

  filename = data.archive_file.no_op_lambda.output_path

  handler = "lambda.handler"
  runtime = "nodejs22.x"

  memory_size = 512
  timeout     = 30

  role = aws_iam_role.lambda_exec.arn

  tags = {
    Name        = "${var.user_pool_name}-post-confirmation"
    Environment = var.name
  }

  logging_config {
    log_format = "Text"
    log_group  = aws_cloudwatch_log_group.post_confirmation.name
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


}

resource "aws_cloudwatch_log_group" "post_confirmation" {
  name              = "/aws/lambda/${var.user_pool_name}-post-confirmation"
  retention_in_days = 14
}

resource "aws_iam_policy" "lambda_logging" {
  name        = "${var.user_pool_name}-lambda-logging-role"
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
      "Resource": [
        "arn:aws:logs:*:*:/aws/lambda/${var.user_pool_name}-post-confirmation",
        "arn:aws:logs:*:*:/aws/lambda/${var.user_pool_name}-post-confirmation:*",
        "arn:aws:logs:*:*:/aws/lambda/${var.user_pool_name}-pre-sign-up",
        "arn:aws:logs:*:*:/aws/lambda/${var.user_pool_name}-pre-sign-up:*"
      ],
      "Effect": "Allow"
    }
  ]
}
EOF
}


locals {
  metric_transformation_name_post_confirmation = "${var.user_pool_name}-error-count-post-confirmation"
  metric_transformation_name_pre_sign_up       = "${var.user_pool_name}-error-count-pre-sign-up"
  metric_transformation_namespace              = "LambdaErrors"
}


# Create metric filter for ERROR logs
resource "aws_cloudwatch_log_metric_filter" "error_logs_post_confirmation" {
  name           = "${var.user_pool_name}-error-logs-post-confirmation"
  pattern        = "ERROR"
  log_group_name = aws_cloudwatch_log_group.post_confirmation.name

  metric_transformation {
    name          = local.metric_transformation_name_post_confirmation
    namespace     = local.metric_transformation_namespace
    value         = "1" # Emitted when metric matches
    default_value = "0" # Emitted when metric does not match
    unit          = "Count"
  }
}

# Create CloudWatch alarm for error metric
resource "aws_cloudwatch_metric_alarm" "lambda_errors_post_confirmation" {
  alarm_name          = "${var.user_pool_name}-error-alarm-post-confirmation"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  datapoints_to_alarm = 1
  metric_name         = local.metric_transformation_name_post_confirmation
  namespace           = local.metric_transformation_namespace
  unit                = "Count"
  period              = 60
  statistic           = "Sum"
  threshold           = 0
  treat_missing_data  = "notBreaching"
  alarm_description   = "This metric monitors error logs in the Cognito Post Confirmation Lambda trigger function"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

# Create metric filter for ERROR logs
resource "aws_cloudwatch_log_metric_filter" "error_logs_pre_sign_up" {
  name           = "${var.user_pool_name}-error-logs-pre-sign-up"
  pattern        = "ERROR"
  log_group_name = aws_cloudwatch_log_group.pre_sign_up.name

  metric_transformation {
    name          = local.metric_transformation_name_pre_sign_up
    namespace     = local.metric_transformation_namespace
    value         = "1" # Emitted when metric matches
    default_value = "0" # Emitted when metric does not match
    unit          = "Count"
  }
}

resource "aws_sns_topic" "alerts" {
  name = "${var.user_pool_name}-error-notifications"
}


# Create CloudWatch alarm for error metric
resource "aws_cloudwatch_metric_alarm" "lambda_errors_pre_sign_up" {
  alarm_name          = "${var.user_pool_name}-error-alarm-pre-sign-up"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  datapoints_to_alarm = 1
  metric_name         = local.metric_transformation_name_pre_sign_up
  namespace           = local.metric_transformation_namespace
  unit                = "Count"
  period              = 60
  statistic           = "Sum"
  threshold           = 0
  treat_missing_data  = "notBreaching"
  alarm_description   = "This metric monitors error logs in the Cognito Pre Sign Up Lambda trigger function"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

resource "aws_iam_role" "lambda_exec" {
  name = "${var.user_pool_name}-lambda-role"

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

resource "aws_iam_role_policy_attachment" "lambda_logging_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_logging.arn
}

locals {
  user_pool = aws_cognito_user_pool.pool
}


# Allow Cognito to invoke the Lambda functions
resource "aws_lambda_permission" "allow_cognito_pre_sign_up" {
  statement_id  = "AllowCognitoPreSignUp"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.pre_sign_up.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = local.user_pool.arn
}

resource "aws_lambda_permission" "allow_cognito_post_confirmation" {
  statement_id  = "AllowCognitoPostConfirmation"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_confirmation.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = local.user_pool.arn
}
