
output "gateway_url" {
  value = aws_apigatewayv2_api.api.api_endpoint
}