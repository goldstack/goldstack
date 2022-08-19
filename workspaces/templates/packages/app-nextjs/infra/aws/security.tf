 resource "aws_cloudfront_response_headers_policy" "security_headers_policy" {
  name = "security-headers-policy-${random_id.id.hex}"
  security_headers_config {
    content_type_options {
      override = true
    }
    frame_options {
      frame_option = "DENY"
      override = true
    }
    referrer_policy {
      referrer_policy = "same-origin"
      override = true
    }
    xss_protection {
      mode_block = true
      protection = true
      override = true
    }
    strict_transport_security {
      access_control_max_age_sec = "63072000"
      include_subdomains = true
      preload = true
      override = true
    }

    content_security_policy {
      content_security_policy = "frame-ancestors 'none'; default-src https: data: 'unsafe-eval' 'unsafe-inline' 'self'; object-src 'none'"
      override = true
    }
  }
}