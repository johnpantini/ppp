{% if pillar['service_name'] is defined and pillar['service_type'] is defined %}
/etc/systemd/system/{{ pillar['service_name'] }}:
  file.managed:
    - source: salt://ppp/systemd/ppp@.service
    - template: jinja

systemctl daemon-reload:
  cmd.run: []

systemctl enable {{ pillar['service_name'] }}:
  cmd.run: []

systemctl restart {{ pillar['service_name'] }}:
  cmd.run: []
{% endif %}
