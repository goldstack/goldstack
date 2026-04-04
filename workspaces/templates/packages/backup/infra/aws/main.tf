
resource "aws_backup_vault" "main" {
  name = var.backup_vault_name

  tags = {
    ManagedBy = "terraform"
  }
}

resource "aws_backup_vault_policy" "main" {
  count = var.destination_account_id != "" ? 1 : 0

  backup_vault_name = aws_backup_vault.main.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowDestinationAccountCopy"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${var.destination_account_id}:root"
        }
        Action = [
          "backup:CopyFromBackupVault"
        ]
        Resource = aws_backup_vault.main.arn
      }
    ]
  })
}

resource "aws_iam_role" "backup" {
  name = "${var.resource_prefix}BackupRole"

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
  name = "${var.resource_prefix}BackupPolicy"
  role = aws_iam_role.backup.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat(
      [
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
            "backup:ListTags",
            "backup:CopyFromBackupVault",
            "backup:CopyIntoBackupVault"
          ]
          Resource = "*"
        },
        {
          Sid    = "S3Permissions"
          Effect = "Allow"
          Action = [
            "s3:GetBucketTagging",
            "s3:GetBucketVersioning",
            "s3:PutBucketVersioning",
            "s3:GetBucketLocation",
            "s3:GetBucketAcl",
            "s3:ListBucket",
            "s3:ListBucketVersions",
            "s3:GetObject",
            "s3:GetObjectTagging",
            "s3:GetObjectVersionTagging",
            "s3:ListAllMyBuckets"
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
            "dynamodb:DescribeTable",
            "dynamodb:CreateBackup",
            "dynamodb:StartAwsBackupJob",
            "dynamodb:ListTagsOfResource",
            "dynamodb:ListTables",
            "dynamodb:RestoreTableFromBackup"
          ]
          Resource = "arn:aws:dynamodb:*:*:table/*"
        },
        {
          Sid    = "KMSPermissions"
          Effect = "Allow"
          Action = [
            "kms:Decrypt",
            "kms:DescribeKey",
            "kms:Encrypt",
            "kms:GenerateDataKey"
          ]
          Resource = "*"
        },
        {
          Sid    = "KMSCreateGrant"
          Effect = "Allow"
          Action = [
            "kms:CreateGrant"
          ]
          Resource = "*"
          Condition = {
            StringEquals = {
              "kms:ViaService" = "backup.${var.aws_region}.amazonaws.com"
            }
          }
        }
      ],
      var.destination_kms_key_arn != "" ? [
        {
          Sid    = "DestinationKMSPermissions"
          Effect = "Allow"
          Action = [
            "kms:Decrypt",
            "kms:Encrypt",
            "kms:GenerateDataKey",
            "kms:GenerateDataKeyWithoutPlaintext",
            "kms:DescribeKey"
          ]
          Resource = var.destination_kms_key_arn
        }
      ] : [],
      var.destination_account_id != "" ? [
        {
          Sid    = "DestinationVaultPermissions"
          Effect = "Allow"
          Action = [
            "backup:CopyIntoBackupVault",
            "backup:DescribeBackupVault"
          ]
          Resource = "*"
        }
      ] : []
    )
  })
}

resource "aws_backup_plan" "main" {
  name = "${var.resource_prefix}BackupPlan"

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
  name         = "${var.resource_prefix}Resources"
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
