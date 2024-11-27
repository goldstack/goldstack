#!/bin/bash

# IAM Role and Policy
yarn infra terraform import aws_iam_role.lambda_exec app-nextjs-bootstrap.templates.dev.goldstack.party-edge
yarn infra terraform import aws_iam_policy.lambda_logging app-nextjs-bootstrap.templates.dev.goldstack.party-edge-lambda-logging-role
yarn infra terraform import aws_iam_role_policy_attachment.edge_lambda_logs app-nextjs-bootstrap.templates.dev.goldstack.party-edge/app-nextjs-bootstrap.templates.dev.goldstack.party-edge-lambda-logging-role

# Lambda and CloudWatch
yarn infra terraform import "aws_lambda_function.edge" "app-nextjs-bootstrap-templates-dev-goldstack-party-edge"
yarn infra terraform import "aws_cloudwatch_log_group.edge" "/aws/lambda/app-nextjs-bootstrap-templates-dev-goldstack-party-edge"

# S3 Bucket Root and its configurations
yarn infra terraform import aws_s3_bucket.website_root app-nextjs-bootstrap.templates.dev.goldstack.party-root
yarn infra terraform import aws_s3_bucket_public_access_block.website_root app-nextjs-bootstrap.templates.dev.goldstack.party-root
yarn infra terraform import aws_s3_bucket_ownership_controls.website_root app-nextjs-bootstrap.templates.dev.goldstack.party-root
yarn infra terraform import aws_s3_bucket_acl.website_root app-nextjs-bootstrap.templates.dev.goldstack.party-root
yarn infra terraform import aws_s3_bucket_policy.website_root app-nextjs-bootstrap.templates.dev.goldstack.party-root

# CloudFront Distribution and Route53
yarn infra terraform import aws_cloudfront_distribution.website_cdn_root $(aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[?contains(@,'app-nextjs-bootstrap.templates.dev.goldstack.party')]].Id" --output text)
yarn infra terraform import aws_route53_record.website_cdn_root_record dev.goldstack.party_app-nextjs-bootstrap.templates.dev.goldstack.party_A

# Security Headers Policy
yarn infra terraform import aws_cloudfront_response_headers_policy.security_headers_policy $(aws cloudfront list-response-headers-policies --query "ResponseHeadersPolicyList.Items[?Name.contains(@,'policy-')].Id" --output text)

# Note: The following redirect resources are only imported if website_domain_redirect is set
# Uncomment if you have redirect configuration:

# # S3 Bucket Redirect and its configurations
# yarn infra terraform import aws_s3_bucket.website_redirect[0] app-nextjs-bootstrap.templates.dev.goldstack.party-redirect
# yarn infra terraform import aws_s3_bucket_public_access_block.website_redirect[0] app-nextjs-bootstrap.templates.dev.goldstack.party-redirect
# yarn infra terraform import aws_s3_bucket_ownership_controls.website_redirect[0] app-nextjs-bootstrap.templates.dev.goldstack.party-redirect
# yarn infra terraform import aws_s3_bucket_acl.website_redirect[0] app-nextjs-bootstrap.templates.dev.goldstack.party-redirect
# yarn infra terraform import aws_s3_bucket_policy.website_redirect[0] app-nextjs-bootstrap.templates.dev.goldstack.party-redirect
# yarn infra terraform import aws_s3_bucket_object.redirect_file[0] app-nextjs-bootstrap.templates.dev.goldstack.party-redirect/index.html

# # CloudFront Distribution and Route53 for Redirect
# yarn infra terraform import aws_cloudfront_distribution.website_cdn_redirect[0] <REDIRECT_DISTRIBUTION_ID>
# yarn infra terraform import aws_route53_record.website_cdn_redirect_record[0] dev.goldstack.party_<REDIRECT_DOMAIN>_A
