FROM alpine:latest as tailscale
WORKDIR /tailscale
COPY . ./
ENV TSFILE=tailscale_1.34.1_amd64.tgz
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

COPY --chown=root ./start.sh /app/start.sh
COPY ./tailscale-proxy.mjs /app/tailscale-proxy.mjs
COPY --from=tailscale /tailscale/tailscaled /app/tailscaled
COPY --from=tailscale /tailscale/tailscale /app/tailscale

RUN chmod +x /app/start.sh

EXPOSE 24344

USER root
CMD ["/app/start.sh"]
