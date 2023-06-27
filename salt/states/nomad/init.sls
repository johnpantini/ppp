{% if pillar['rpmProxy'] is defined %}
{% set cpuarch = salt['grains.item']('cpuarch')['cpuarch'] %}
dnf -y install {{ pillar['rpmProxy'] }}{{ pillar['nomad'][cpuarch]['rpm'] }}:
  cmd.run: []

/etc/nomad.d/server.hcl:
  file.managed:
    - source: salt://ppp/lib/aspirant/etc/nomad.d/server.hcl
    - user: nomad

/etc/nomad.d/nomad.hcl:
  file.absent: []

systemctl disable nomad:
  cmd.run: []
{% endif %}
