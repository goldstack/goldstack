#!/bin/bash

# API Gateway Resources
yarn infra terraform import aws_apigatewayv2_api.api $(terraform output -raw api_gateway_id)
yarn infra terraform import aws_apigatewayv2_stage.default $(terraform output -raw api_gateway_id)/$default

# Lambda Functions
yarn infra terraform import 'aws_lambda_function.this["default"]' goldstack-test-lambda-api-__default
yarn infra terraform import 'aws_lambda_function.this["ANY /admin/{proxy+}"]' goldstack-test-lambda-api-admin-_proxy__
yarn infra terraform import 'aws_lambda_function.this["ANY /cart/{sessionId}/items"]' goldstack-test-lambda-api-cart-_sessionId_-items
yarn infra terraform import 'aws_lambda_function.this["ANY /echo"]' goldstack-test-lambda-api-echo
yarn infra terraform import 'aws_lambda_function.this["ANY /order/{id}"]' goldstack-test-lambda-api-order-_id_
yarn infra terraform import 'aws_lambda_function.this["ANY /user"]' goldstack-test-lambda-api-user-__index
yarn infra terraform import 'aws_lambda_function.this["ANY /user/{userId}"]' goldstack-test-lambda-api-user-_userId_

# CloudWatch Log Groups
yarn infra terraform import 'aws_cloudwatch_log_group.this["default"]' /aws/lambda/goldstack-test-lambda-api-__default
yarn infra terraform import 'aws_cloudwatch_log_group.this["ANY /admin/{proxy+}"]' /aws/lambda/goldstack-test-lambda-api-admin-_proxy__
yarn infra terraform import 'aws_cloudwatch_log_group.this["ANY /cart/{sessionId}/items"]' /aws/lambda/goldstack-test-lambda-api-cart-_sessionId_-items
yarn infra terraform import 'aws_cloudwatch_log_group.this["ANY /echo"]' /aws/lambda/goldstack-test-lambda-api-echo
yarn infra terraform import 'aws_cloudwatch_log_group.this["ANY /order/{id}"]' /aws/lambda/goldstack-test-lambda-api-order-_id_
yarn infra terraform import 'aws_cloudwatch_log_group.this["ANY /user"]' /aws/lambda/goldstack-test-lambda-api-user-__index
yarn infra terraform import 'aws_cloudwatch_log_group.this["ANY /user/{userId}"]' /aws/lambda/goldstack-test-lambda-api-user-_userId_

# API Gateway Routes and Integrations
yarn infra terraform import 'aws_apigatewayv2_route.this["default"]' $(terraform output -raw api_gateway_route_default_id)
yarn infra terraform import 'aws_apigatewayv2_route.this["ANY /admin/{proxy+}"]' $(terraform output -raw api_gateway_route_admin_proxy_id)
yarn infra terraform import 'aws_apigatewayv2_route.this["ANY /cart/{sessionId}/items"]' $(terraform output -raw api_gateway_route_cart_items_id)
yarn infra terraform import 'aws_apigatewayv2_route.this["ANY /echo"]' $(terraform output -raw api_gateway_route_echo_id)
yarn infra terraform import 'aws_apigatewayv2_route.this["ANY /order/{id}"]' $(terraform output -raw api_gateway_route_order_id)
yarn infra terraform import 'aws_apigatewayv2_route.this["ANY /user"]' $(terraform output -raw api_gateway_route_user_index_id)
yarn infra terraform import 'aws_apigatewayv2_route.this["ANY /user/{userId}"]' $(terraform output -raw api_gateway_route_user_id)

yarn infra terraform import 'aws_apigatewayv2_integration.this["default"]' $(terraform output -raw api_gateway_integration_default_id)
yarn infra terraform import 'aws_apigatewayv2_integration.this["ANY /admin/{proxy+}"]' $(terraform output -raw api_gateway_integration_admin_proxy_id)
yarn infra terraform import 'aws_apigatewayv2_integration.this["ANY /cart/{sessionId}/items"]' $(terraform output -raw api_gateway_integration_cart_items_id)
yarn infra terraform import 'aws_apigatewayv2_integration.this["ANY /echo"]' $(terraform output -raw api_gateway_integration_echo_id)
yarn infra terraform import 'aws_apigatewayv2_integration.this["ANY /order/{id}"]' $(terraform output -raw api_gateway_integration_order_id)
yarn infra terraform import 'aws_apigatewayv2_integration.this["ANY /user"]' $(terraform output -raw api_gateway_integration_user_index_id)
yarn infra terraform import 'aws_apigatewayv2_integration.this["ANY /user/{userId}"]' $(terraform output -raw api_gateway_integration_user_id)

# Lambda Permissions
yarn infra terraform import 'aws_lambda_permission.this["default"]' $(terraform output -raw lambda_permission_default_id)
yarn infra terraform import 'aws_lambda_permission.this["ANY /admin/{proxy+}"]' $(terraform output -raw lambda_permission_admin_proxy_id)
yarn infra terraform import 'aws_lambda_permission.this["ANY /cart/{sessionId}/items"]' $(terraform output -raw lambda_permission_cart_items_id)
yarn infra terraform import 'aws_lambda_permission.this["ANY /echo"]' $(terraform output -raw lambda_permission_echo_id)
yarn infra terraform import 'aws_lambda_permission.this["ANY /order/{id}"]' $(terraform output -raw lambda_permission_order_id)
yarn infra terraform import 'aws_lambda_permission.this["ANY /user"]' $(terraform output -raw lambda_permission_user_index_id)
yarn infra terraform import 'aws_lambda_permission.this["ANY /user/{userId}"]' $(terraform output -raw lambda_permission_user_id)

# IAM Roles and Policies
yarn infra terraform import aws_iam_role.lambda_exec lambda-api-role-$(terraform output -raw random_id)
yarn infra terraform import aws_iam_role_policy_attachment.lambda_admin_role_attach lambda-api-role-$(terraform output -raw random_id)/arn:aws:iam::aws:policy/AdministratorAccess
yarn infra terraform import aws_iam_policy.lambda_logging lambda-api-logging-role-$(terraform output -raw random_id)
yarn infra terraform import aws_iam_role_policy_attachment.lambda_logs lambda-api-role-$(terraform output -raw random_id)/lambda-api-logging-role-$(terraform output -raw random_id)

# Domain and Certificate Resources
yarn infra terraform import aws_acm_certificate.wildcard $(terraform output -raw certificate_arn)
yarn infra terraform import aws_route53_record.a $(terraform output -raw route53_zone_id)_$(terraform output -raw api_domain)_A
yarn infra terraform import aws_apigatewayv2_domain_name.domain lambda-api.examples.templates.dev.goldstack.party
yarn infra terraform import aws_apigatewayv2_api_mapping.mapping $(terraform output -raw api_gateway_domain_name_id)/$(terraform output -raw api_gateway_mapping_id)

# Certificate Validation Records (these might need adjustment based on actual values)
yarn infra terraform import 'aws_route53_record.wildcard_validation["*.lambda-api.examples.templates.dev.goldstack.party"]' $(terraform output -raw route53_zone_id)_$(terraform output -raw validation_record_name)_$(terraform output -raw validation_record_type)
