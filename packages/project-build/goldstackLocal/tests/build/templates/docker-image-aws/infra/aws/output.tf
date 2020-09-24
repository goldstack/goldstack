
output "repo_arn" {
  value = "${aws_ecr_repository.main.arn}"
}

output "repo_url" {
  value = "${aws_ecr_repository.main.repository_url}"
}

output "registry_id" {
  value = "${aws_ecr_repository.main.registry_id}"
}

output "cluster_name" {
  value = "${aws_ecs_cluster.main.name}"
}

output "ecs_task_execution_role_arn" {
  value = "${aws_iam_role.ecs_task_execution_role.arn}"
}

output "ecs_task_role_arn" {
  value = "${aws_iam_role.ecs_task_role.arn}"
}

output "vpc" {
  value = "${sort(data.aws_vpcs.default.ids)[0]}"
}

output "subnet" {
  value = "${sort(data.aws_subnet_ids.default.ids)[0]}"
}

output "container_security_group" {
  value = "${aws_security_group.main.id}"
}