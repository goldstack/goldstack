
output "gateway_url" {
  value = aws_apigatewayv2_api.api.api_endpoint
}

output "static_files_bucket" {
  value = aws_s3_bucket.static_files.bucket
}

output "public_files_bucket" {
  value = aws_s3_bucket.public_files.bucket
}