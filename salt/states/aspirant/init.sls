/bin/cp /salt/states/ppp/lib/aspirant/start.sh /usr/sbin/start-aspirant.sh:
  cmd.run: []

/bin/chmod +x /usr/sbin/start-aspirant.sh:
  cmd.run: []

/salt/states/ppp/lib/http-shell.py:
  file.managed:
    - source: salt://ppp/lib/aspirant/http-shell.py

{% if pillar['serviceName'] is defined %}
/etc/systemd/system/{{ pillar['serviceName'] }}.service:
  file.managed:
    - source: salt://ppp/lib/aspirant/aspirant@.service
    - template: jinja

systemctl daemon-reload:
  cmd.run: []

systemctl reset-failed:
  cmd.run: []

systemctl enable {{ pillar['serviceName'] }}.service:
  cmd.run: []

systemctl restart {{ pillar['serviceName'] }}.service:
  cmd.run: []
{% endif %}
