

# Create SNS topic for error notifications
resource "aws_sns_topic" "alerts" {
  name = "${var.lambda_name}-error-notifications"
}

# Add email subscription to SNS topic
# resource "aws_sns_topic_subscription" "alerts" {
#   topic_arn = aws_sns_topic.alerts.arn
#   protocol  = "email-json" # just "email" seems to have some weird bugs
#   endpoint  = "your-email-here"
# }

