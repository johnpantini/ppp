wget {{ pillar['nginx']['tar'] }} -q -O nginx.tar.gz:
  cmd.run: []

rm -rf /usr/src/nginx && mkdir -p /usr/src/nginx && tar -zxC /usr/src/nginx -f nginx.tar.gz --strip-components=1:
  cmd.run: []

dnf -y install pcre pcre2 pcre-devel pcre2-devel libxml2 libxml2-devel libxslt libxslt-devel:
  cmd.run: []

mkdir -p /usr/lib/nginx:
  cmd.run: []

mkdir -p /usr/lib/nginx/logs:
  cmd.run: []

/etc/nginx/nginx.conf:
  file.managed:
    - source: salt://ppp/lib/aspirant/etc/nginx/nginx.conf
    - makedirs: True

/etc/nginx/njs/api/v1.js:
  file.managed:
    - source: salt://ppp/lib/aspirant/etc/nginx/njs/api/v1.js
    - makedirs: True

njs:
  git.latest:
    - name: https://github.com/nginx/njs.git
    - target: /usr/src/njs

/bin/sh -c 'cd /usr/src/nginx && ./configure --prefix=/usr/lib/nginx --sbin-path=/usr/sbin/nginx --conf-path=/etc/nginx/nginx.conf --pid-path=/usr/lib/nginx/nginx.pid --with-http_ssl_module --with-stream --with-pcre --with-compat --add-dynamic-module=/salt/states/ppp/lib/nginx/ngx-unzip --add-dynamic-module=/usr/src/njs/nginx':
  cmd.run: []

/bin/sh -c 'cd /usr/src/nginx && make -j$(nproc)':
  cmd.run: []

/usr/sbin/nginx:
  file.managed:
    - source: /usr/src/nginx/objs/nginx
    - mode: '0755'

/usr/lib/nginx/modules/ngx_http_js_module.so:
  file.managed:
    - source: /usr/src/nginx/objs/ngx_http_js_module.so
    - makedirs: True

/usr/lib/nginx/modules/ngx_stream_js_module.so:
  file.managed:
    - source: /usr/src/nginx/objs/ngx_stream_js_module.so
    - makedirs: True

/usr/lib/nginx/modules/ngx_http_unzip_module.so:
  file.managed:
    - source: /usr/src/nginx/objs/ngx_http_unzip_module.so
    - makedirs: True
