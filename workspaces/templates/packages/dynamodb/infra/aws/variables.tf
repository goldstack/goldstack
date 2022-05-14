
variable "aws_region" {
  description = "Region where the S3 bucket is deployed."
  type = string
}

variable "table_name" {
  description = "Name of the Dynamo DB table."
  type = string
}

