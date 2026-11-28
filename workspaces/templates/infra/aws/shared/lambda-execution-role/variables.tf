variable "role_name" {
  description = "Name of the IAM role used as the execution role for the Lambda functions."
  type        = string
}

variable "description" {
  description = "Description of the IAM role."
  type        = string
  default     = "Execution role for Goldstack Lambda functions."
}

variable "policy_name" {
  description = "Name of the managed policy that grants the Lambda functions access to AWS resources. Defaults to '<role_name>-policy'."
  type        = string
  default     = ""
}

variable "additional_policy_arns" {
  description = "Additional managed policy ARNs to attach to the execution role."
  type        = list(string)
  default     = []
}

variable "permissions_boundary" {
  description = "Optional ARN of a permissions boundary to apply to the execution role."
  type        = string
  default     = null
}

variable "tags" {
  description = "Tags to apply to the execution role and its managed policy."
  type        = map(string)
  default     = {}
}
