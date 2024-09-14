
resource "hcloud_server" "docker_server" {
  name        = var.server_name
  image       = "ubuntu-22.04"
  server_type = var.server_type # 1 vcpu 2gb ram 20 GB hdd  https://docs.hetzner.com/cloud/servers/overview
  location    = var.location # https://docs.hetzner.com/cloud/general/locations/
  ssh_keys    = data.hcloud_ssh_key.my_ssh_key.*.id

  user_data = file("cloud-init.yml")

  shutdown_before_deletion = true

  firewall_ids = [hcloud_firewall.goldstack_firewall.id]

  lifecycle {
    ignore_changes = [
      user_data, # this is required since we are injecting into this file - usually should only change the files in server/ - if this file needs to be changed, need to destroy first or manually remove this
    ]
  }

}

data "hcloud_ssh_key" "my_ssh_key" {
  count       = var.ssh_user_fingerprint != null ? 1 : 0
  fingerprint = var.ssh_user_fingerprint
}


resource "hcloud_firewall" "goldstack_firewall" {
  name = "firewall-${var.server_name}"

  dynamic "rule" {
    for_each = var.only_allow_ssh_access_from_ip != "" ? [
      {
        direction = "in"
        protocol  = "tcp"
        port      = "22"
        source_ips = [var.only_allow_ssh_access_from_ip]
      }
    ] : [
      {
        direction = "in"
        protocol  = "tcp"
        port      = "22"
        source_ips = ["0.0.0.0/0", "::/0"]
      }
    ]

    content {
      direction = rule.value.direction
      protocol  = rule.value.protocol
      port      = rule.value.port
      source_ips = rule.value.source_ips
    }
  }

  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "80"
    source_ips = ["0.0.0.0/0", "::/0"]
  }

  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "443"
    source_ips = ["0.0.0.0/0", "::/0"]
  }

  rule {
    direction = "out"
    protocol  = "tcp"
    port      = "any"
    destination_ips = ["0.0.0.0/0", "::/0"]
  }
}

#resource "hcloud_ssh_key" "my_ssh_key" {
#  name       = "my-key"
#  public_key = file("~/.ssh/id_ed25519.pub")
#}
