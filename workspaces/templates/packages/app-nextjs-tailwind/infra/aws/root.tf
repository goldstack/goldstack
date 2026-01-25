# Creates bucket to store the static website
resource "aws_s3_bucket" "website_root" {
  bucket = "${var.website_domain}-root"

  # Remove this line if you want to prevent accidential deletion of bucket
  force_destroy = true

  tags = {
    ManagedBy = "terraform"
    Changed   = formatdate("YYYY-MM-DD hh:mm ZZZ", timestamp())
  }

  lifecycle {
    ignore_changes = [tags]
  }
}

resource "aws_s3_bucket_website_configuration" "website_root" {
  bucket = aws_s3_bucket.website_root.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
}

resource "aws_s3_bucket_public_access_block" "website_root" {
  bucket = aws_s3_bucket.website_root.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_ownership_controls" "website_root" {
  bucket = aws_s3_bucket.website_root.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "website_root" {
  depends_on = [
    aws_s3_bucket_public_access_block.website_root,
    aws_s3_bucket_ownership_controls.website_root,
  ]

  bucket = aws_s3_bucket.website_root.id
  acl    = "public-read"

}

resource "aws_s3_bucket_policy" "website_root" {
  bucket = aws_s3_bucket.website_root.id

  depends_on = [
    aws_s3_bucket_public_access_block.website_root,
    aws_s3_bucket_ownership_controls.website_root,
  ]

  policy = data.aws_iam_policy_document.website_root.json
}

data "aws_iam_policy_document" "website_root" {
  statement {
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }

    actions = [
      "s3:GetObject",
    ]

    resources = [
      "arn:aws:s3:::${var.website_domain}-root/*"
    ]
  }
}

resource "aws_cloudfront_function" "routing" {
  name    = "${replace(var.website_domain, ".", "-")}-routing"
  runtime = "cloudfront-js-2.0"
  code    = var.routing_function_code
  comment = "Next.js routing function"

  lifecycle {
    ignore_changes = [code]
  }
}

# Creates the CloudFront distribution to serve the static website
resource "aws_cloudfront_distribution" "website_cdn_root" {
  enabled     = true
  price_class = "PriceClass_All"
  aliases     = [var.website_domain]
  provider    = aws.us-east-1

  depends_on = [
  ]

  origin {
    domain_name = aws_s3_bucket_website_configuration.website_root.website_endpoint

    origin_id = "origin-bucket-${aws_s3_bucket.website_root.id}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_root_object = "index.html"


  # Priority 0
  ordered_cache_behavior {
    path_pattern     = "_next/static/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "origin-bucket-${aws_s3_bucket.website_root.id}"

    response_headers_policy_id = "eaab4381-ed33-4a86-88ca-d9558dc6cd63"
    cache_policy_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized
    origin_request_policy_id   = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf"
    compress                   = true
    viewer_protocol_policy     = "redirect-to-https"
  }

  # Priority 1
  # Behaviour bypassing edge lambda
  # Path pattern can be changed to '*' here if no dynamic routes are used
  # This will result in a slight performance increase and decreased costs
  ordered_cache_behavior {
    path_pattern     = "index.html"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "origin-bucket-${aws_s3_bucket.website_root.id}"

    response_headers_policy_id = "eaab4381-ed33-4a86-88ca-d9558dc6cd63"
    cache_policy_id            = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    origin_request_policy_id   = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf"
    compress                   = true
    viewer_protocol_policy     = "redirect-to-https"
  }

  # Priority 2
  # Using CloudFront function to handle dynamic paths
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "origin-bucket-${aws_s3_bucket.website_root.id}"

    viewer_protocol_policy     = "redirect-to-https"
    response_headers_policy_id = "eaab4381-ed33-4a86-88ca-d9558dc6cd63"
    compress                   = true
    cache_policy_id            = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.routing.arn
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = data.aws_acm_certificate.wildcard_website.arn
    ssl_support_method  = "sni-only"
  }

  custom_error_response {
    error_caching_min_ttl = 60
    error_code            = 404
    response_page_path    = "/404.html"
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
      # Ignoring this so we can update the lambda version during deployments
      # default_cache_behavior[0].lambda_function_association,
    ]
  }
}

# Creates the DNS record to point on the main CloudFront distribution ID
resource "aws_route53_record" "website_cdn_root_record" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.website_domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website_cdn_root.domain_name
    zone_id                = aws_cloudfront_distribution.website_cdn_root.hosted_zone_id
    evaluate_target_health = false
  }
}