resource "aws_backup_region_settings" "main" {
  resource_type_opt_in_preference = {
    "DynamoDB" = true
    "S3"       = true
  }
}
