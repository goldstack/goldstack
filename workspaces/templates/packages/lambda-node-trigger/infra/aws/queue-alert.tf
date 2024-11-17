resource "aws_cloudwatch_metric_alarm" "alarm" {
  count = length(var.sqs_queue_name) > 0 ? 1 : 0
  
  alarm_name          = "${aws_sqs_queue.queue[0].name}-too-many-messages-alarm"
  alarm_description   = "The ${aws_sqs_queue.queue[0].name} main queue has a large number of queued items"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 300
  statistic           = "Average"
  threshold           = var.sqs_queue_max_items
  treat_missing_data  = "notBreaching"
  alarm_actions      = [aws_sns_topic.alerts.arn]
  dimensions = {
    "QueueName" = aws_sqs_queue.queue[0].name
  }
}

resource "aws_cloudwatch_metric_alarm" "deadletter_alarm" {
  count = length(var.sqs_queue_name) > 0 ? 1 : 0

  alarm_name          = "${aws_sqs_queue.dlq[0].name}-message-received-alarm"
  alarm_description   = "Items are on the ${aws_sqs_queue.dlq[0].name} queue"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 120
  statistic           = "Average"
  threshold           = 1
  treat_missing_data  = "notBreaching"
  alarm_actions      = [aws_sns_topic.alerts.arn]
  dimensions = {
    "QueueName" = aws_sqs_queue.dlq[0].name
  }
}