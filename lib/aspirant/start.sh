#!/bin/sh

trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

# https://github.com/hashicorp/nomad/blob/85ed8ddd4fc41b371fb4d652bb9149129893ae6d/client/allocdir/fs_linux.go#L45
rm -rf /var/lib/nomad
mkdir -p /var/lib/nomad
chown -R ppp /var/lib/nomad /etc/nomad.d
chown -R nginx /etc/nginx

ln -sf /usr/local/bin/node /usr/bin/node

echo 'Starting up node buddy...'
/usr/bin/node /ppp/lib/aspirant/buddy.mjs &
P1=$!

echo 'Starting up Consul...'
consul agent -dev -config-file=/etc/consul/server.json &
P2=$!

echo 'Starting up Nomad...'
runuser -u ppp -- nomad agent -dev -config=/etc/nomad.d/server.hcl &
P3=$!

echo 'Starting up nginx...'
nginx -g 'daemon off;' &
P4=$!

while test -z $(curl -s http://127.0.0.1:4646/v1/agent/health); do
  sleep 1
done

echo 'Nomad agent is OK. Resurrecting workers...'

if [[ -z "${SYSTEMD_EXEC_PID}" ]]; then
  curl -s -XPOST http://127.0.0.1/nginx/internal/resurrect -d "{\"ASPIRANT_ID\":\"$ASPIRANT_ID\",\"GLOBAL_PROXY_URL\":\"$GLOBAL_PROXY_URL\",\"REDIS_HOST\":\"$REDIS_HOST\",\"REDIS_PORT\":\"$REDIS_PORT\",\"REDIS_TLS\":\"$REDIS_TLS\",\"REDIS_REDIS_USERNAME\":\"$REDIS_REDIS_USERNAME\",\"REDIS_PASSWORD\":\"$REDIS_PASSWORD\",\"REDIS_DATABASE\":\"$REDIS_DATABASE\"}"
else
  curl -s -XPOST http://127.0.0.1:8080/nginx/internal/resurrect -d "{\"ASPIRANT_ID\":\"$ASPIRANT_ID\",\"GLOBAL_PROXY_URL\":\"$GLOBAL_PROXY_URL\",\"REDIS_HOST\":\"$REDIS_HOST\",\"REDIS_PORT\":\"$REDIS_PORT\",\"REDIS_TLS\":\"$REDIS_TLS\",\"REDIS_REDIS_USERNAME\":\"$REDIS_REDIS_USERNAME\",\"REDIS_PASSWORD\":\"$REDIS_PASSWORD\",\"REDIS_DATABASE\":\"$REDIS_DATABASE\"}"
fi

wait $P1 $P2 $P3 $P4
