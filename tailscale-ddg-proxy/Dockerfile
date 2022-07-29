FROM alpine:latest as tailscale
WORKDIR /tailscale
COPY . ./
ENV TSFILE=tailscale_1.28.0_amd64.tgz
RUN wget https://pkgs.tailscale.com/stable/${TSFILE} && \
  tar xzf ${TSFILE} --strip-components=1
COPY . ./

FROM alpine:latest
RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*
RUN mkdir -p /var/run/tailscale
RUN mkdir -p /var/cache/tailscale
RUN mkdir -p /var/lib/tailscale

FROM alpine:latest AS base
RUN apk add --no-cache --update nodejs-current tini
WORKDIR /app
ENTRYPOINT ["/sbin/tini", "-s", "--"]

COPY ./start.sh /app/start.sh
COPY ./tailscale-ddg-proxy.mjs /app/tailscale-ddg-proxy.mjs
COPY --from=tailscale /tailscale/tailscaled /app/tailscaled
COPY --from=tailscale /tailscale/tailscale /app/tailscale

EXPOSE 24344

USER root
CMD ["/app/start.sh"]
