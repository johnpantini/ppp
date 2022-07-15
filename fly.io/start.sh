#!/bin/sh

echo 'Starting up tailscale...'

modprobe xt_mark

echo 'net.ipv4.ip_forward = 1' | tee -a /etc/sysctl.conf
echo 'net.ipv6.conf.all.forwarding = 1' | tee -a /etc/sysctl.conf
sysctl -p /etc/sysctl.conf

iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
ip6tables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

/app/tailscaled --verbose=1 --port 41641 &
sleep 5
if [ ! -S /var/run/tailscale/tailscaled.sock ]; then
    echo "tailscaled.sock does not exist, terminated!"
    exit 1
fi

until /app/tailscale up \
    --authkey=${TAILSCALE_AUTH_KEY} \
    --hostname=fly-${FLY_REGION} \
    --advertise-exit-node
do
    sleep 0.1
done

echo 'Tailscale started.'
sleep infinity
