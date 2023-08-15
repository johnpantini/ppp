FROM nginx:1.24-alpine3.17 AS builder

RUN wget "http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz" -q -O nginx.tar.gz
RUN apk add --no-cache --virtual .build-deps \
  gcc \
  libc-dev \
  make \
  openssl-dev \
  pcre2-dev \
  zlib-dev \
  linux-headers \
  libxslt-dev \
  gd-dev \
  geoip-dev \
  libedit-dev \
  bash \
  alpine-sdk \
  findutils

SHELL ["/bin/ash", "-eo", "pipefail", "-c"]

RUN rm -rf /usr/src/nginx && mkdir -p /usr/src/nginx && tar -zxC /usr/src/nginx -f nginx.tar.gz

COPY ./nginx/ /usr/src/

WORKDIR /usr/src/nginx/nginx-${NGINX_VERSION}

RUN CONFARGS=$(nginx -V 2>&1 | sed -n -e 's/^.*arguments: //p') && \
    sh -c "./configure --with-compat $CONFARGS --add-dynamic-module=/usr/src/ngx-unzip" && make modules

FROM node:19.9.0-alpine3.17 as node

FROM nginx:1.24-alpine3.17 AS base
RUN apk add --no-cache --update runuser gcompat nomad consul freetype-dev cairo-dev pango-dev \
  libpng libpng-dev jpeg libjpeg-turbo libjpeg-turbo-dev jpeg-dev giflib-dev librsvg-dev

RUN adduser -D ppp

COPY --from=builder /usr/src/nginx/nginx-${NGINX_VERSION}/objs/*_module.so /etc/nginx/modules/
COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/share /usr/local/share
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

WORKDIR /salt/states/ppp/lib

COPY ./aspirant/http-shell.py ./http-shell.py
COPY ./aspirant/start.sh ./aspirant/start.sh

COPY ./canvas/ ./canvas/
COPY ./canvas-table/ ./canvas-table/
COPY ./fonts/ ./fonts/
COPY ./pdfjs/ ./pdfjs/
COPY ./pg/ ./pg/
COPY ./ssh2/ ./ssh2/
COPY ./uWebSockets.js/ ./uWebSockets.js/
COPY ./websocket/ ./websocket/

COPY ./aspirant/etc/consul/server.json /etc/consul/server.json
COPY ./aspirant/etc/nomad.d/server.hcl /etc/nomad.d/server.hcl
COPY ./aspirant/etc/nginx/ /etc/nginx

USER root

RUN chmod +x /salt/states/ppp/lib/aspirant/start.sh

EXPOSE 80

CMD ["/salt/states/ppp/lib/aspirant/start.sh"]
