
# HTTP API

resource "aws_apigatewayv2_api" "api" {
  name        = "lambda-api-gateway-${random_id.id.hex}"
  description = "API for Goldstack lambda deployment"
	protocol_type = "HTTP"

  dynamic "cors_configuration" {
    for_each = var.cors != null ? [1] : []
    content {
      allow_credentials = true
      allow_headers = ["Content-Type","Accept","x-csrf-token"]
      allow_methods = ["GET","OPTIONS","POST","PUT","DELETE","PATCH"]
      allow_origins = [var.cors]
    }
  }
}

# see https://github.com/terraform-aws-modules/terraform-aws-apigateway-v2/blob/v1.5.1/main.tf#L137
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true

  # Conservative default limits for requests, adjust for your usecase as required
  default_route_settings {
    throttling_rate_limit  = 30 
    throttling_burst_limit = 60
  }
}
