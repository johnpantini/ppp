PPP user:
  user.present:
    - name: ppp

PPP group:
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

rm -rf /var/cache/salt:
  cmd.run: []
