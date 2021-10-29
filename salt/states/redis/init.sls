{% set cpuarch = salt['grains.item']('cpuarch')['cpuarch'] %}

Pip Redis:
  pip.installed:
    - name: redis
    - upgrade: True

Install Redis:
  pkg.installed:
    - name: redis
    - sources:
        - redis: {{ pillar['redis'][cpuarch]['rpm'] }}

/etc/redis.conf:
  file.managed:
    - source: salt://redis/redis.conf
    - template: jinja
    - user: redis

redis:
  service.running:
    - enable: True
