#!/bin/sh

/app/tailscaled --tun=userspace-networking --socks5-server=localhost:${PORT} &
/app/tailscale up --authkey=${TAILSCALE_AUTHKEY} --hostname=tailscale-socks5
echo Tailscale is now running
