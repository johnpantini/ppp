{% if pillar['tailnetDomain'] is defined %}
mkdir -p /usr/lib/nginx/certs/{{ pillar["tailnetDomain"] }}:
  cmd.run: []

/bin/sh -c 'cd /usr/lib/nginx/certs/{{ pillar["tailnetDomain"] }} && tailscale cert {{ pillar["tailnetDomain"] }}':
  cmd.run: []

chmod 644 /usr/lib/nginx/certs/{{ pillar["tailnetDomain"] }}/{{ pillar["tailnetDomain"] }}.crt:
  cmd.run: []

chmod 644 /usr/lib/nginx/certs/{{ pillar["tailnetDomain"] }}/{{ pillar["tailnetDomain"] }}.key:
  cmd.run: []
{% endif %}
{% if pillar['sslReplacement'] is defined %}
/etc/nginx/nginx.conf:
  file.replace:
    - pattern: 'listen 80;'
    - repl: '{{ pillar["sslReplacement"] }}'
    - backup: False
{% endif %}

nginx user:
  user.present:
    - name: nginx

nginx group:
  group.present:
    - name: nginx
    - members:
        - nginx

Use nginx user in nginx.conf:
  file.replace:
    - name: /etc/nginx/nginx.conf
    - pattern: 'error_log stderr;'
    - repl: 'error_log stderr; user nginx;'
    - backup: False

chown -R nginx /etc/nginx:
  cmd.run: []
