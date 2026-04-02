
output "backup_vault_arn" {
  description = "ARN of the backup vault"
  value       = aws_backup_vault.main.arn
}

output "kms_key_arn" {
  description = "ARN of the KMS key used for encryption"
  value       = aws_kms_key.main.arn
}

output "backup_vault_name" {
  description = "Name of the backup vault"
  value       = aws_backup_vault.main.name
}