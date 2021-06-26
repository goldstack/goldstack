output "lambda_arn" {
  value = aws_lambda_function.main.arn
}

output "lambda_invoke_arn" {
  value = aws_lambda_function.main.invoke_arn
}

output "lambda_function_name" {
  value = aws_lambda_function.main.function_name
}

output "gateway_url" {
  value = aws_api_gateway_deployment.main.invoke_url
}