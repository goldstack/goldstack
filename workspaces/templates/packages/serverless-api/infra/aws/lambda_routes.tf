# Dynamically creates the infrastructure for every lambda defined in the routes/ directory

data "archive_file" "empty_lambda" {
  type = "zip"
  output_path = "${path.module}/empty_lambda.zip"

  source {
    content = "exports.handler = function() { };"
    filename = "lambda.js"
  }
}

resource "aws_lambda_function" "this" {
  for_each  = var.lambdas
  
  function_name =  lookup(each.value, "function_name", null)

  filename = data.archive_file.empty_lambda.output_path

  handler = "lambda.handler"
  runtime = "nodejs20.x"

  memory_size = 2048
  timeout = 27 # default Gateway timeout is 29 s

  role = aws_iam_role.lambda_exec.arn

  lifecycle {
    create_before_destroy = true
    ignore_changes = [
       filename,
    ]
  }

  environment {
    variables = {
      GOLDSTACK_DEPLOYMENT = var.name
      CORS                 = var.cors
      NODE_OPTIONS         = "--enable-source-maps"
    }
  }

  logging_config {
    log_format = "Text"
    log_group = aws_cloudwatch_log_group.this[each.key].name
  }
}

resource "aws_cloudwatch_log_group" "this" {
  for_each = var.lambdas

  name              = "/aws/lambda/${lookup(each.value, "function_name", null)}"
  retention_in_days = 30
}

resource "aws_apigatewayv2_route" "this" {
  for_each  = var.lambdas

  api_id    = aws_apigatewayv2_api.api.id
  route_key = lookup(each.value, "route", "$default")

  target    = "integrations/${aws_apigatewayv2_integration.this[each.key].id}"
}

resource "aws_apigatewayv2_integration" "this" {
  for_each         = var.lambdas
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"

  payload_format_version    = "2.0"
  connection_type           = "INTERNET"
  description               = "Dynamic lambda integration"
  integration_method        = "POST"
  integration_uri          = aws_lambda_function.this[each.key].invoke_arn
}

resource "aws_lambda_permission" "this" {
  for_each      = var.lambdas
	action        = "lambda:InvokeFunction"
	function_name = aws_lambda_function.this[each.key].function_name 
	principal     = "apigateway.amazonaws.com"

  # /*/* part allows invocation from any stage, method and resource path
  # within API Gateway HTTP API.
	source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}
