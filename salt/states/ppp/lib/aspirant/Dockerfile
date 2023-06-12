FROM nginx:1.24-alpine AS builder

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

FROM nginx:1.24-alpine AS base
RUN apk add --no-cache --update runuser nodejs-current gcompat nomad consul freetype-dev cairo-dev pango-dev \
  libpng libpng-dev jpeg libjpeg-turbo libjpeg-turbo-dev jpeg-dev giflib-dev librsvg-dev

RUN adduser -D ppp

COPY --from=builder /usr/src/nginx/nginx-${NGINX_VERSION}/objs/*_module.so /etc/nginx/modules/

WORKDIR /salt/states/ppp/lib

COPY ./aspirant/http-shell.py ./http-shell.py
COPY ./aspirant/start.sh ./aspirant/start.sh

COPY ./uWebSockets.js/ ./uWebSockets.js/
COPY ./canvas/ ./canvas/
COPY ./canvas-table/ ./canvas-table/
COPY ./fonts/ ./fonts/
COPY ./pg/ ./pg/
COPY ./pdfjs/ ./pdfjs/
COPY ./ssh2/ ./ssh2/
COPY ./websocket/ ./websocket/
COPY ./vendor/ ./vendor/

COPY ./aspirant/etc/consul/server.json /etc/consul/server.json
COPY ./aspirant/etc/nomad.d/server.hcl /etc/nomad.d/server.hcl
COPY ./aspirant/etc/nginx/ /etc/nginx

USER root

RUN chmod +x /salt/states/ppp/lib/aspirant/start.sh

EXPOSE 80

CMD ["/salt/states/ppp/lib/aspirant/start.sh"]
