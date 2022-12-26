{% if pillar['serviceName'] is defined and pillar['serviceType'] is defined %}
/etc/systemd/system/{{ pillar['serviceName'] }}.timer:
  file.managed:
    - source: salt://ppp/systemd/ppp@.timer
    - template: jinja

systemctl daemon-reload:
  cmd.run: []

systemctl reset-failed:
  cmd.run: []

systemctl enable {{ pillar['serviceName'] }}.timer:
  cmd.run: []
{% endif %}
