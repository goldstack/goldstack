
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
resource "aws_lambda_permission" "apigw" {
	action        = "lambda:InvokeFunction"
	function_name = aws_lambda_function.main.arn
	principal     = "apigateway.amazonaws.com"

  # The /*/* part allows invocation from any stage, method and resource path
  # within API Gateway REST API.
	source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_apigatewayv2_integration" "lambda_root" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"

  connection_type           = "INTERNET"
  description               = "Root lambda integration"
  integration_method        = "POST"
  integration_uri           = aws_lambda_function.main.invoke_arn
}

resource "aws_apigatewayv2_route" "lambda_root" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /{proxy+}"

  target = "integrations/${aws_apigatewayv2_integration.lambda_root.id}"
}