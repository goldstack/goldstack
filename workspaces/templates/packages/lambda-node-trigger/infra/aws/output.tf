output "lambda_arn" {
  value = aws_lambda_function.main.arn
}

output "lambda_invoke_arn" {
  value = aws_lambda_function.main.invoke_arn
}

output "lambda_function_name" {
  value = aws_lambda_function.main.function_name
}

output "sqs_queue_name" {
  value = length(var.sqs_queue_name) > 0 ? aws_sqs_queue.queue[0].name : null
}

output "sqs_queue_url" {
  value = length(var.sqs_queue_name) > 0 ? aws_sqs_queue.queue[0].url : null
}

output "sqs_dlq_queue_name" {
  value = length(var.sqs_queue_name) > 0 ? aws_sqs_queue.dlq[0].name : null
}

output "sqs_dlq_queue_url" {
  value = length(var.sqs_queue_name) > 0 ? aws_sqs_queue.dlq[0].url : null
}
