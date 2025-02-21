variable "aws_region" {
  description = "Region where the Lambda is deployed."
  type = string
}

variable "lambda_name" {
  description = "Name of the Lambda."
  type = string
}

variable "schedule" {
  description = "Schedule of the Lambda"
  type = string
  default = ""
}

variable "sqs_queue_name" {
  type    = string
  description = "A name of a SQS queue to be created. Any messages posted to this queue will trigger the Lambda."
  default = ""
}

variable "sqs_queue_max_items" {
  type    = string
  description = "The maximum items of we want in the queue - otherwise an alert is triggered."
  default = 1000
}

variable "name" {
  description = "Goldstack deployment name."
  type = string
}

