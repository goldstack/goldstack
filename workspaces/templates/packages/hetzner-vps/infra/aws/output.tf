output "server_id" {
  value = hcloud_server.docker_server.id
}

output "ipv4_address" {
  value = hcloud_server.docker_server.ipv4_address
}

output "ipv6_address" {
  value = hcloud_server.docker_server.ipv6_address
}

