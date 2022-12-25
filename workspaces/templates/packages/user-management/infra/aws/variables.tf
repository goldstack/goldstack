
variable "aws_region" {
  description = "Region where the User Pool should be deployed."
  type = string
}

variable "user_pool_name" {
  description = "Name of the User Pool."
  type = string
}

variable "cognito_domain" {
  description = "Domain where Cognito can be accessed."
  type = string
}

variable "hosted_zone_domain" {
  description = "Domain of hosted zone where Cognito domain should be configured."
  type = string
}

variable "callback_url" {
  description = "URL of page that users should be redirected too after a successful login"
  type = string
}
