
resource "hcloud_server" "docker_server" {
  name        = var.server_name
  image       = "ubuntu-22.04"
  server_type = var.server_type # 1 vcpu 2gb ram 20 GB hdd  https://docs.hetzner.com/cloud/servers/overview
  location    = var.location # https://docs.hetzner.com/cloud/general/locations/
  ssh_keys    = data.hcloud_ssh_key.my_ssh_key.*.id

  user_data = file("cloud-init.yml")

  shutdown_before_deletion = true

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


#resource "hcloud_ssh_key" "my_ssh_key" {
#  name       = "my-key"
#  public_key = file("~/.ssh/id_ed25519.pub")
#}
