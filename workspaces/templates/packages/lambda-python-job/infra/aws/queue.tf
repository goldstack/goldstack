

# Only create the SQS queue if the sqs_queue_name is not provided (conditional creation)
resource "aws_sqs_queue" "queue" {
  count = length(var.sqs_queue_name) == 0 ? 1 : 0
  name  = "${var.lambda_name}-queue"

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount     = 5  # The number of times a message can be received before being moved to DLQ
  })
}

resource "aws_sqs_queue" "dlq" {
  count = length(var.sqs_queue_name) > 0 ? 1 : 0
  name = "${var.lambda_name}-dlq"
}

resource "aws_iam_role_policy_attachment" "lambda_dlq_access" {
  count = length(var.sqs_queue_name) > 0 ? 1 : 0
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole"
}

resource "aws_lambda_permission" "sqs_trigger" {
  count        = length(var.sqs_queue_name) > 0 || aws_sqs_queue.queue.count > 0 ? 1 : 0
  statement_id = "AllowSQSInvokeLambda"
  action       = "lambda:InvokeFunction"
  function_name = aws_lambda_function.main.function_name
  principal    = "sqs.amazonaws.com"
  source_arn   = length(var.sqs_queue_name) > 0 ? aws_sqs_queue.queue[count.index].arn : aws_sqs_queue.queue.arn
}

resource "aws_lambda_event_source_mapping" "sqs_event" {
  count            = length(var.sqs_queue_name) > 0 || aws_sqs_queue.queue.count > 0 ? 1 : 0
  event_source_arn = length(var.sqs_queue_name) > 0 ? aws_sqs_queue.queue[count.index].arn : aws_sqs_queue.queue.arn
  function_name    = aws_lambda_function.main.arn
  enabled          = true
  batch_size       = 10  # Customize this based on your needs
}
