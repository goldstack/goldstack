resource "aws_cloudwatch_event_rule" "schedule-lambda" {
  name                  = "${var.lambda_name}-trigger"
  description           = "Triggers lambda function"
  schedule_expression   = "rate(1 minutes)"
}

resource "aws_cloudwatch_event_target" "lambda_function_target" {
  target_id = "lambda-${var.lambda_name}"
  rule      = aws_cloudwatch_event_rule.schedule-lambda.name
  arn       = aws_lambda_function.main.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_trigger" {    
    statement_id = "AllowExecutionFromCloudWatch"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.main.function_name
    principal = "events.amazonaws.com"
    source_arn = aws_cloudwatch_event_rule.schedule_lambda.arn
}