output "website_cdn_root_id" {
  description = "Main CloudFront Distribution ID"
  value       = aws_cloudfront_distribution.website_cdn_root.id
}

output "edge_function_name" {
  description = "Lambda@Edge name for routing"
  value       = aws_lambda_function.edge.function_name 
}