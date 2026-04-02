
variable "aws_region" {
  description = "Region where the backup vault is deployed."
  type        = string
}

variable "allowed_account_ids" {
  description = "List of AWS account IDs allowed to copy backups to this vault."
  type        = list(string)
  default     = []
}