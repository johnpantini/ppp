PPP User:
  user.present:
    - name: ppp

PPP Group:
  group.present:
    - name: ppp
    - members:
      - ppp

mkdir -p /salt/states/ppp:
  cmd.run: []

PPP Salt directory:
  file.directory:
    - name: /salt/states/ppp
    - user: ppp
    - group: ppp

/salt/states/ppp:
  file.recurse:
    - source: salt://ppp
    - user: ppp
    - group: ppp
    - replace: True

/salt/states/ppp/lib/http-shell.py:
  file.managed:
    - source: salt://ppp/lib/aspirant/http-shell.py

rm -rf /var/cache/salt:
  cmd.run: []
