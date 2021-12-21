# Dynamically creates the infrastructure for every lambda defined in the routes/ directory

resource "aws_lambda_function" "this" {
  for_each  = var.lambdas
  
  function_name =  lookup(each.value, "function_name", null)

  filename = data.archive_file.empty_lambda.output_path

  handler = "root.handler"
  runtime = "nodejs12.x"

  memory_size = 2048
  timeout = 27 # default Gateway timeout is 29 s

  role = aws_iam_role.lambda_exec.arn

  lifecycle {
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
}


resource "aws_apigatewayv2_route" "this" {
  for_each  = var.lambdas

  api_id    = aws_apigatewayv2_api.api.id
  route_key = each.key

  target    = "integrations/${aws_apigatewayv2_integration.this[each.key].id}"

}


resource "aws_apigatewayv2_integration" "this" {
  for_each         = var.lambdas
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"

  connection_type           = "INTERNET"
  description               = "Dynamic lambda integration"
  integration_method        = "POST"
  integration_uri           = aws_lambda_function.this[each.key].invoke_arn
}
