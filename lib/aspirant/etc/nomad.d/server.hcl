data_dir = "/var/lib/nomad"
disable_update_check = true
enable_syslog = false
log_level = "WARN"
name = "aspirant"
datacenter = "ppp"
bind_addr = "127.0.0.1"
plugin_dir = "/usr/lib/nomad/plugins"

server {
  enabled = true
  bootstrap_expect = 1
}

client {
  enabled = true
  cpu_total_compute = 1000

  template {
    disable_file_sandbox = true
  }

  cni_config_dir = "/etc/cni"
  cni_path = "/usr/libexec/cni"

  options = {
    "driver.allowlist" = "raw_exec"
    "fingerprint.denylist" = "env_aws,env_azure,env_digitalocean,env_gce,bridge"
  }
}

ui {
  enabled = true
}
