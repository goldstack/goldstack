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
  value = var.sqs_queue_name 
}

output "sqs_dlq_queue_name" {
  value = "${var.lambda_name}-dlq" 
}
