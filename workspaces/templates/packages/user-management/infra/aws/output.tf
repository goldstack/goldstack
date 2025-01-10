output "user_pool_id" {
  value = aws_cognito_user_pool.pool.id
}

output "endpoint" {
  value = aws_cognito_user_pool.pool.endpoint
}


output "user_pool_client_id" {
  value = aws_cognito_user_pool_client.client.id
}

output "post_confirmation_lambda_function_name" {
  value = aws_lambda_function.post_confirmation.function_name
}

output "pre_sign_up_lambda_function_name" {
  value = aws_lambda_function.pre_sign_up.function_name
}
