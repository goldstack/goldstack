variable "aws_region" {
  description = "Region where the Lambda is deployed."
  type = string
}


variable "api_domain" {
  description = "Domain under which the API should be deployed."
  type = string
}

variable "hosted_zone_domain" {
  description = "Domain for a hosted zone in AWS Route 53 that api_domain will be configured in."
  type = string
}

variable "name" {
  description = "Goldstack deployment name."
  type = string
}

variable "cors" {
  description = "Domain for an UI that should be allowed to access this server."
  type = string
  default = ""
}

# Add routes https://github.com/terraform-aws-modules/terraform-aws-apigateway-v2/blob/master/variables.tf#L191
# see here for different variable types https://www.terraform.io/language/values/variables
variable "lambdas" {
  description = "Map of endpoint and lambdas for API"
  type        = map
}
