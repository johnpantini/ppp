{% if pillar['rpmProxy'] is defined %}
{% set cpuarch = salt['grains.item']('cpuarch')['cpuarch'] %}
dnf -y install {{ pillar['rpmProxy'] }}{{ pillar['consul'][cpuarch]['rpm'] }}:
  cmd.run: []

/etc/consul.d/server.json:
  file.managed:
    - source: salt://ppp/lib/aspirant/etc/consul/server.json
    - user: consul

/etc/consul.d/consul.hcl:
  file.absent: []

systemctl disable consul:
  cmd.run: []
{% endif %}
