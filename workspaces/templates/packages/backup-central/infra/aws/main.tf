
resource "aws_kms_key" "main" {
  description             = "KMS key for encrypting backups at rest"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    ManagedBy = "terraform"
  }
}

resource "aws_kms_alias" "main" {
  name          = "alias/backup-central"
  target_key_id = aws_kms_key.main.key_id
}

resource "aws_backup_vault" "main" {
  name        = "GoldstackCentral"
  kms_key_arn = aws_kms_key.main.arn

  tags = {
    ManagedBy = "terraform"
  }
}

resource "aws_backup_vault_policy" "main" {
  backup_vault_name = aws_backup_vault.main.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCopyIntoVault"
        Effect = "Allow"
        Principal = {
          AWS = [for acct in var.allowed_account_ids : "arn:aws:iam::${acct}:root"]
        }
        Action = [
          "backup:CopyIntoBackupVault"
        ]
        Resource = aws_backup_vault.main.arn
      }
    ]
  })
}