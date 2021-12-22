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

/opt/ppp/lib:
  file.recurse:
    - source: salt://ppp/lib
    - user: pppuser
    - group: ppp
    - replace: True
