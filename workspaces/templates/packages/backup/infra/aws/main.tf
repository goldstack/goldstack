
resource "aws_backup_vault" "main" {
  name = "GoldstackLocal"

  tags = {
    ManagedBy = "terraform"
  }
}

resource "aws_iam_role" "backup" {
  name = "GoldstackBackupRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "backup.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    ManagedBy = "terraform"
  }
}

resource "aws_iam_role_policy" "backup" {
  name = "GoldstackBackupPolicy"
  role = aws_iam_role.backup.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "BackupPermissions"
        Effect = "Allow"
        Action = [
          "backup:StartBackupJob",
          "backup:StopBackupJob",
          "backup:DescribeBackupJob",
          "backup:ListBackupJobs",
          "backup:ListRecoveryPoints",
          "backup:DeleteRecoveryPoint",
          "backup:GetBackupVaultNotifications",
          "backup:ListTags"
        ]
        Resource = "*"
      },
      {
        Sid    = "S3Permissions"
        Effect = "Allow"
        Action = [
          "s3:GetBucketVersioning",
          "s3:PutBucketVersioning",
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::*",
          "arn:aws:s3:::*/*"
        ]
      },
      {
        Sid    = "DynamoDBPermissions"
        Effect = "Allow"
        Action = [
          "dynamodb:ListTables",
          "dynamodb:DescribeTable",
          "dynamodb:BackupTable",
          "dynamodb:RestoreTableFromBackup"
        ]
        Resource = "arn:aws:dynamodb:*:*:table/*"
      },
      {
        Sid    = "KMSPermissions"
        Effect = "Allow"
        Action = [
          "kms:CreateGrant",
          "kms:Decrypt",
          "kms:DescribeKey",
          "kms:Encrypt",
          "kms:GenerateDataKey"
        ]
        Resource = "*"
        Condition = {
          StringLike = {
            "kms:ResourceAliases" : "alias/aws/backup*"
          }
        }
      }
    ]
  })
}

resource "aws_backup_plan" "main" {
  name = "GoldstackBackupPlan"

  rule {
    rule_name         = "DailyBackup"
    target_vault_name = aws_backup_vault.main.name
    schedule          = var.schedule
    start_window      = 60
    completion_window = 180
    lifecycle {
      delete_after = var.retention_days
    }
    dynamic "copy_action" {
      for_each = var.central_backup_vault_arn != "" ? [1] : []
      content {
        destination_vault_arn = var.central_backup_vault_arn
        lifecycle {
          delete_after = var.retention_days
        }
      }
    }
  }

  tags = {
    ManagedBy = "terraform"
  }
}

resource "aws_backup_selection" "main" {
  plan_id      = aws_backup_plan.main.id
  name         = "GoldstackResources"
  iam_role_arn = aws_iam_role.backup.arn

  resources = [
    "arn:aws:s3:::*",
    "arn:aws:dynamodb:*:*:table/*"
  ]

  condition {
    string_not_equals {
      key   = "aws:ResourceTag/goldstack:no_backup"
      value = "true"
    }
  }
}