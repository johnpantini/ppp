#!/bin/sh

if test -n "${TAILSCALE_AUTH_KEY-}"; then
  echo 'Starting up tailscale...'

  /app/tailscaled --tun=userspace-networking --socks5-server=localhost:1055 --outbound-http-proxy-listen=localhost:1055 &
  /app/tailscale up --hostname=${TAILSCALE_HOSTNAME:=tailscale-proxy} --authkey=${TAILSCALE_AUTH_KEY}

  echo 'Tailscale started.'
fi

node --no-warnings --inspect=0.0.0.0:9229 tailscale-proxy.mjs
