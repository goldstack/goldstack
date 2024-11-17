# Only create the SQS queue if sqs_queue_name is provided
resource "aws_sqs_queue" "queue" {
  count = length(var.sqs_queue_name) > 0 ? 1 : 0
  name  = "${var.lambda_name}-queue"

  visibility_timeout_seconds = 950

  # Redrive policy to send failed messages to the DLQ if DLQ is created
  redrive_policy = count.index == 0 && length(aws_sqs_queue.dlq) > 0 ? jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq[0].arn
    maxReceiveCount     = 5  
  }) : null
}

# Only create the DLQ if sqs_queue_name is provided
resource "aws_sqs_queue" "dlq" {
  count = length(var.sqs_queue_name) > 0 ? 1 : 0
  name  = "${var.lambda_name}-dlq"
}

# Only attach the DLQ access policy if both SQS queue and DLQ are created
resource "aws_iam_role_policy_attachment" "lambda_dlq_access" {
  count      = length(var.sqs_queue_name) > 0 ? 1 : 0
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole"
}

# Add permission for SQS to trigger Lambda
resource "aws_lambda_permission" "sqs_trigger" {
  count        = length(var.sqs_queue_name) > 0 ? 1 : 0
  statement_id = "AllowSQSInvokeLambda"
  action       = "lambda:InvokeFunction"
  function_name = aws_lambda_function.main.function_name
  principal    = "sqs.amazonaws.com"
  source_arn   = aws_sqs_queue.queue[0].arn
}

# Create Event Source Mapping (Link SQS to Lambda)
resource "aws_lambda_event_source_mapping" "sqs_event" {
  count            = length(var.sqs_queue_name) > 0 ? 1 : 0
  event_source_arn = aws_sqs_queue.queue[0].arn
  function_name    = aws_lambda_function.main.arn
  enabled          = true
  batch_size       = 10  # Customize this based on your needs
}