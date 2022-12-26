{% if pillar['serviceName'] is defined and pillar['serviceType'] is defined %}
/etc/systemd/system/{{ pillar['serviceName'] }}.service:
  file.managed:
    - source: salt://ppp/systemd/ppp@.service
    - template: jinja

systemctl daemon-reload:
  cmd.run: []

systemctl reset-failed:
  cmd.run: []

systemctl enable {{ pillar['serviceName'] }}.service:
  cmd.run: []
{% endif %}
