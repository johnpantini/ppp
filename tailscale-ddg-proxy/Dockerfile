FROM node:18-alpine as builder
WORKDIR /app
COPY . ./

FROM alpine:latest as tailscale
WORKDIR /app
COPY . ./
ENV TSFILE=tailscale_1.28.0_amd64.tgz
RUN wget https://pkgs.tailscale.com/stable/${TSFILE} && \
  tar xzf ${TSFILE} --strip-components=1
COPY . ./

FROM alpine:latest
RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*

COPY --from=builder /app/start.sh /app/start.sh
COPY --from=builder /app/tailscale-ddg-proxy.mjs /app/tailscale-ddg-proxy.mjs
COPY --from=tailscale /app/tailscaled /app/tailscaled
COPY --from=tailscale /app/tailscale /app/tailscale
RUN mkdir -p /var/run/tailscale
RUN mkdir -p /var/cache/tailscale
RUN mkdir -p /var/lib/tailscale

USER root
CMD ["/app/start.sh"]
