{% set cpuarch = salt['grains.item']('cpuarch')['cpuarch'] %}
{% set filename = salt['cmd.run']('basename ' ~ pillar['node'][cpuarch]['tar'] ~ ' .tar.xz') %}

/opt/ppp:
  archive.extracted:
    - source: {{ pillar['node'][cpuarch]['tar'] }}
    - archive_format: tar
    - enforce_toplevel: False
    - skip_verify: True

/bin/node:
  file.symlink:
    - target: /opt/ppp/{{ filename }}/bin/node
    - force: True

/bin/npm:
  file.symlink:
    - target: /opt/ppp/{{ filename }}/bin/npm
    - force: True

{% if pillar['npm'] is defined and pillar['npm']['proxy'] is defined %}
npm config set proxy {{ pillar['npm']['proxy'] }}:
  cmd.run: []

npm config set https-proxy {{ pillar['npm']['proxy'] }}:
  cmd.run: []
{% endif %}

npm config set prefix /usr:
  cmd.run: []

npm install --global node-gyp:
  cmd.run: []
