resource "aws_cognito_user_pool" "pool" {
  name          = var.user_pool_name
}

resource "aws_cognito_user_pool_client" "client" {
  name          = "${var.user_pool_name}-client"
  user_pool_id  = aws_cognito_user_pool.pool.id
}


resource "aws_cognito_user_pool_domain" "main" {
  domain          = data.aws_acm_certificate.wildcard.domain
  certificate_arn = aws_acm_certificate.wildcard.arn
  user_pool_id    = aws_cognito_user_pool.pool.id

  depends_on = [
    aws_acm_certificate_validation.wildcard_validation,
  ]
}

resource "aws_cognito_user_pool_ui_customization" "ui" {
  css        = ".label-customizable {font-weight: 400;}"
  image_file = filebase64("favicon-32x32.png")

  # Refer to the aws_cognito_user_pool_domain resource's
  # user_pool_id attribute to ensure it is in an 'Active' state
  user_pool_id = aws_cognito_user_pool_domain.main.user_pool_id
}