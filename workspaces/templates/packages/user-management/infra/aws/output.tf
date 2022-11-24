output "user_pool_id" {
  value = aws_cognito_user_pool.pool.id
}

output "endpoint" {
  value = aws_cognito_user_pool.pool.endpoint
}


output "user_pool_client_id" {
  value = aws_cognito_user_pool_client.client.id
}