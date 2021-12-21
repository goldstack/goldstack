
# HTTP API
resource "aws_apigatewayv2_api" "api" {
  name        = "${var.lambda_name}-gateway"
  description = "API for Goldstack lambda deployment ${var.lambda_name}"
	protocol_type = "HTTP"
	# target        = aws_lambda_function.main.arn
}

# see https://github.com/terraform-aws-modules/terraform-aws-apigateway-v2/blob/v1.5.1/main.tf#L137
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}


# Permission