{% set cpuarch = salt['grains.item']('cpuarch')['cpuarch'] %}

Install Redis:
  pkg.installed:
    - name: redis
    - sources:
        - redis: {{ pillar['redis'][cpuarch]['rpm'] }}

/etc/redis/redis.conf:
  file.managed:
    - source: salt://redis/redis.conf
    - template: jinja
    - user: redis

/etc/redis/sentinel.conf:
  file.managed:
    - source: salt://redis/sentinel.conf
    - template: jinja
    - user: redis

firewall-cmd --permanent --zone=public --add-port=26379/tcp:
  cmd.run: []

firewall-cmd --reload:
  cmd.run: []

redis:
  service.running:
    - enable: True
