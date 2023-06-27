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
