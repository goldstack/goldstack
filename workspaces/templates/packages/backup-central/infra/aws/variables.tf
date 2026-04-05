
variable "aws_region" {
  description = "Region where the backup vault is deployed."
  type        = string
}

variable "allowed_account_ids" {
  description = "List of AWS account IDs allowed to copy backups to this vault."
  type        = list(string)
  default     = []
}

variable "source_account_ids" {
  description = "List of AWS account IDs that are sources for cross-account backup copies."
  type        = list(string)
  default     = []
}

variable "source_role_arns" {
  description = "List of IAM role ARNs from source accounts allowed to copy backups to this vault."
  type        = list(string)
  default     = []
}

variable "backup_vault_name" {
  description = "Name of the backup vault. Must be unique within the region."
  type        = string
  default     = "GoldstackCentral"
}

variable "manage_region_settings" {
  description = "Whether to manage backup region settings. Set to false if another configuration manages these settings to avoid conflicts."
  type        = bool
  default     = true
}
