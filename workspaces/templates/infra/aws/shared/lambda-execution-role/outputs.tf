output "role_arn" {
  description = "ARN of the Lambda execution role."
  value       = aws_iam_role.this.arn
}

output "role_name" {
  description = "Name of the Lambda execution role."
  value       = aws_iam_role.this.name
}

output "policy_arn" {
  description = "ARN of the managed policy attached to the Lambda execution role."
  value       = aws_iam_policy.this.arn
}
