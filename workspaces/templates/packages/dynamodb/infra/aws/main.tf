
# Table is created by external script and just referenced here
data "aws_dynamodb_table" "main" {
  name = var.table_name
}