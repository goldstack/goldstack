output "table_arn" {
  value = data.aws_dynamodb_table.main.arn
}

output "table_name" {
  value = data.aws_dynamodb_table.main.id
}