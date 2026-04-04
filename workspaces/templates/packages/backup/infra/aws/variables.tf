
variable "aws_region" {
  description = "Region where the backup configuration is deployed."
  type        = string
}

variable "schedule" {
  description = "Cron expression for backup schedule (e.g., cron(0 5 * * ? *) for daily at 5 AM UTC)"
  type        = string
  default     = "cron(0 5 * * ? *)"
}

variable "retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 30
}

variable "central_backup_vault_arn" {
  description = "Optional ARN of central backup vault for cross-account copy"
  type        = string
  default     = ""
}

variable "destination_account_id" {
  description = "AWS account ID of the destination backup vault for cross-account copy"
  type        = string
  default     = ""
}

variable "destination_kms_key_arn" {
  description = "ARN of the KMS key in the destination account for encrypting copied backups"
  type        = string
  default     = ""
}
