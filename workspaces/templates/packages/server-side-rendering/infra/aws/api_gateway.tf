
# HTTP API

resource "aws_apigatewayv2_api" "api" {
  name        = "lambda-api-gateway-${random_id.id.hex}"
  description = "API for Goldstack lambda deployment"
	protocol_type = "HTTP"
}

# see https://github.com/terraform-aws-modules/terraform-aws-apigateway-v2/blob/v1.5.1/main.tf#L137
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}
