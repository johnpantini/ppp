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
RUN apk add --no-cache --update nodejs-current tini gcompat freetype-dev cairo-dev pango-dev libpng libpng-dev jpeg libjpeg-turbo libjpeg-turbo-dev jpeg-dev giflib-dev librsvg-dev

WORKDIR /app

COPY --from=tailscale /tailscale/tailscaled /app/tailscaled
COPY --from=tailscale /tailscale/tailscale /app/tailscale

COPY --chown=root ./aspirant/ ./aspirant/
COPY ./aurora/ ./aurora/
COPY ./uWebSockets.js/ ./uWebSockets.js/
COPY ./canvas/ ./canvas/
COPY ./canvas-table/ ./canvas-table/
COPY ./fonts/ ./fonts/
COPY ./pg/ ./pg/
COPY ./pdfjs/ ./pdfjs/
COPY ./ssh2/ ./ssh2/
COPY ./websocket/ ./websocket/
COPY ./vendor/lzma/ ./vendor/lzma/
COPY ./vendor/protobuf.min.js ./vendor/protobuf.min.js
COPY ./vendor/ioredis.min.js ./vendor/ioredis.min.js

RUN chmod +x /app/aspirant/start.sh

EXPOSE 32456
EXPOSE 9229

USER root
CMD ["/app/aspirant/start.sh"]
