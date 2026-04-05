
resource "aws_backup_region_settings" "main" {
  count = var.manage_region_settings ? 1 : 0

  resource_type_opt_in_preference = {
    DynamoDB          = true
    EBS               = true
    EC2               = true
    EFS               = true
    RDS               = true
    Aurora            = true
    "Storage Gateway" = true
    S3                = true
  }
}

resource "aws_kms_key" "main" {
  description             = "KMS key for encrypting backups at rest"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    ManagedBy = "terraform"
  }
}

resource "aws_kms_alias" "main" {
  name          = "alias/backup-central"
  target_key_id = aws_kms_key.main.key_id
}

resource "aws_kms_key_policy" "main" {
  key_id = aws_kms_key.main.key_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat(
      [
        {
          Sid    = "EnableRootAccess"
          Effect = "Allow"
          Principal = {
            AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
          }
          Action = [
            "kms:*"
          ]
          Resource = "*"
        },
        {
          Sid    = "AllowBackupService"
          Effect = "Allow"
          Principal = {
            Service = "backup.amazonaws.com"
          }
          Action = [
            "kms:Decrypt",
            "kms:Encrypt",
            "kms:GenerateDataKey",
            "kms:GenerateDataKeyWithoutPlaintext",
            "kms:DescribeKey"
          ]
          Resource = "*"
        }
      ],
      length(var.source_account_ids) > 0 ? [
        {
          Sid    = "AllowSourceAccountsEncrypt"
          Effect = "Allow"
          Principal = {
            AWS = [for acct in var.source_account_ids : "arn:aws:iam::${acct}:root"]
          }
          Action = [
            "kms:Decrypt",
            "kms:Encrypt",
            "kms:GenerateDataKey",
            "kms:GenerateDataKeyWithoutPlaintext",
            "kms:DescribeKey"
          ]
          Resource = "*"
        }
      ] : [],
      length(var.source_role_arns) > 0 ? [
        {
          Sid    = "AllowSourceRolesEncrypt"
          Effect = "Allow"
          Principal = {
            AWS = var.source_role_arns
          }
          Action = [
            "kms:Decrypt",
            "kms:Encrypt",
            "kms:GenerateDataKey",
            "kms:GenerateDataKeyWithoutPlaintext",
            "kms:DescribeKey"
          ]
          Resource = "*"
        }
      ] : []
    )
  })
}

data "aws_caller_identity" "current" {}

resource "aws_backup_vault" "main" {
  name        = var.backup_vault_name
  kms_key_arn = aws_kms_key.main.arn

  tags = {
    ManagedBy = "terraform"
  }
}

resource "aws_backup_vault_policy" "main" {
  backup_vault_name = aws_backup_vault.main.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat(
      length(var.allowed_account_ids) > 0 ? [
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
      ] : [],
      length(var.source_role_arns) > 0 ? [
        {
          Sid    = "AllowSourceRolesCopy"
          Effect = "Allow"
          Principal = {
            AWS = var.source_role_arns
          }
          Action = [
            "backup:CopyIntoBackupVault"
          ]
          Resource = aws_backup_vault.main.arn
        }
      ] : []
    )
  })
}
