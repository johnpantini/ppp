ppp:
  group.present: []

pppuser:
  user.present:
    - groups:
        - ppp

PPP Lib dir:
  file.directory:
    - name: /opt/ppp/lib
    - user: pppuser
    - group: ppp

PPP Services dir:
  file.directory:
    - name: /opt/ppp/services
    - user: pppuser
    - group: ppp

/opt/ppp/lib:
  file.recurse:
    - source: salt://ppp/lib
    - user: pppuser
    - group: ppp
    - replace: True

/opt/ppp/services:
  file.recurse:
    - source: salt://ppp/services
    - user: pppuser
    - group: ppp
    - replace: True

rm -rf /var/cache/salt:
  cmd.run: []
