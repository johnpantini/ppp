{% if pillar['service_name'] is defined and pillar['service_type'] is defined %}
/etc/systemd/system/{{ pillar['service_name'] }}.timer:
  file.managed:
    - source: salt://ppp/systemd/ppp@.timer
    - template: jinja

systemctl daemon-reload:
  cmd.run: []

systemctl enable {{ pillar['service_name'] }}.timer:
  cmd.run: []

systemctl restart {{ pillar['service_name'] }}.timer:
  cmd.run: []
{% endif %}
