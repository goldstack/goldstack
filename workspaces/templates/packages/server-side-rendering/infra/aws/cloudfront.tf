# Creates CloudFront distribution to serve static website
resource "aws_cloudfront_distribution" "cdn" {
  enabled     = true
  price_class = "PriceClass_All"
  aliases     = [var.domain]
  provider    = aws.us-east-1

  depends_on = [
  ]

  # Static files from S3
  origin {
    domain_name = aws_s3_bucket_website_configuration.static_files_web.website_endpoint

    origin_id = "origin-bucket-${aws_s3_bucket.static_files.id}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Public files from S3
  origin {
    domain_name = aws_s3_bucket_website_configuration.public_files_web.website_endpoint

    origin_id = "origin-bucket-${aws_s3_bucket.public_files.id}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Dynamic files from API Gateway
  origin {
    domain_name = replace(aws_apigatewayv2_stage.default.invoke_url, "/^https?://([^/]*).*/", "$1")

    origin_id = "origin-api-gateway-${aws_apigatewayv2_api.api.id}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Priority 1 - Static files - these are cached by default
  ordered_cache_behavior {
    path_pattern     = "_goldstack/static/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "origin-bucket-${aws_s3_bucket.static_files.id}"

    cache_policy_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized
    origin_request_policy_id   = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf"
    response_headers_policy_id = "eaab4381-ed33-4a86-88ca-d9558dc6cd63"

    viewer_protocol_policy = "redirect-to-https"
  }

  # Priority 2 - Public files - these are not cached by default
  ordered_cache_behavior {
    path_pattern     = "_goldstack/public/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "origin-bucket-${aws_s3_bucket.public_files.id}"

    cache_policy_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized
    origin_request_policy_id   = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf"
    response_headers_policy_id = "eaab4381-ed33-4a86-88ca-d9558dc6cd63"

    viewer_protocol_policy = "redirect-to-https"
  }

  # Config for favicon resources
  ordered_cache_behavior {
    path_pattern     = "*.png"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "origin-bucket-${aws_s3_bucket.public_files.id}"

    cache_policy_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized
    origin_request_policy_id   = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf"
    response_headers_policy_id = "eaab4381-ed33-4a86-88ca-d9558dc6cd63"

    viewer_protocol_policy = "redirect-to-https"
  }

  ordered_cache_behavior {
    path_pattern     = "favicon.ico"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "origin-bucket-${aws_s3_bucket.public_files.id}"

    cache_policy_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized
    origin_request_policy_id   = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf"
    response_headers_policy_id = "eaab4381-ed33-4a86-88ca-d9558dc6cd63"

    viewer_protocol_policy = "redirect-to-https"
  }

  ordered_cache_behavior {
    path_pattern     = "site.webmanifest"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "origin-bucket-${aws_s3_bucket.public_files.id}"

    cache_policy_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized
    origin_request_policy_id   = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf"
    response_headers_policy_id = "eaab4381-ed33-4a86-88ca-d9558dc6cd63"

    viewer_protocol_policy = "redirect-to-https"
  }

  # Priority 3 - Dynamic resources from API gateway
  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "origin-api-gateway-${aws_apigatewayv2_api.api.id}"

    # CachingOptimized - for SSR, API responses should respect cache headers from Lambda
    cache_policy_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized
    origin_request_policy_id   = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf"
    response_headers_policy_id = "eaab4381-ed33-4a86-88ca-d9558dc6cd63"

    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = data.aws_acm_certificate.wildcard.arn
    ssl_support_method  = "sni-only"
  }

  custom_error_response {
    error_caching_min_ttl = 60
    error_code            = 404
    response_page_path    = "/_goldstack/public/404.html"
    response_code         = 404
  }

  tags = {
    ManagedBy = "terraform"
    Changed   = formatdate("YYYY-MM-DD hh:mm ZZZ", timestamp())
  }

  lifecycle {
    ignore_changes = [
      tags,
      viewer_certificate,
    ]
  }
}