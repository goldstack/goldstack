resource "aws_cognito_user_pool" "pool" {
  name = var.user_pool_name

  # Add your app name to the below
  email_verification_subject = "Your verification code"
  email_verification_message = "Your verification code is {####}."

  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
    mutable             = true

    string_attribute_constraints {
      min_length = 1
      max_length = 100
    }
  }

  schema {
    attribute_data_type      = "String"
    name                     = "custom:app_user_id"
    required                 = false
    mutable                  = false
    string_attribute_constraints {
      max_length = 36
      min_length = 36
    }
  }

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 6
    require_lowercase = false
    require_numbers   = false
    require_symbols   = false
    require_uppercase = false
  }

  device_configuration {
    challenge_required_on_new_device      = true
    device_only_remembered_on_user_prompt = false
  }

  lambda_config {
    pre_sign_up = aws_lambda_function.pre_sign_up.arn
    post_confirmation = aws_lambda_function.post_confirmation.arn
  }
}
