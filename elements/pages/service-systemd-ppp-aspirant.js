import ppp from '../../ppp.js';
import { html, css, ref, repeat } from '../../vendor/fast-element.min.js';
import { validate, invalidate } from '../../lib/ppp-errors.js';
import {
  documentPageFooterPartial,
  documentPageHeaderPartial,
  Page,
  pageStyles,
  PageWithService,
  PageWithSSHTerminal
} from '../page.js';
import { APIS, SERVICE_STATE, SERVICES } from '../../lib/const.js';
import {
  servicePageFooterExtraControls,
  servicePageHeaderExtraControls
} from './service.js';
import { applyMixins } from '../../vendor/fast-utilities.js';
import '../badge.js';
import '../banner.js';
import '../button.js';
import '../query-select.js';
import '../select.js';
import '../terminal.js';
import '../text-field.js';

export const serviceSystemdPppAspirantTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url,
        extraControls: servicePageHeaderExtraControls
      })}
      <section>
        <div class="label-group">
          <h5>Название сервиса</h5>
          <p class="description">
            Произвольное имя, чтобы ссылаться на этот профиль, когда
            потребуется.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="Aspirant"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Хранилище Redis</h5>
          <p class="description">Персистентность для сервиса.</p>
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('redisApiId')}
            value="${(x) => x.document.redisApiId}"
            :context="${(x) => x}"
            :preloaded="${(x) => x.document.redisApi ?? ''}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('apis')
                  .find({
                    $and: [
                      {
                        type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.REDIS%]`
                      },
                      {
                        $or: [
                          { removed: { $ne: true } },
                          { _id: `[%#this.document.redisApiId ?? ''%]` }
                        ]
                      }
                    ]
                  })
                  .sort({ updatedAt: -1 });
              };
            }}"
            :transform="${() => ppp.decryptDocumentsTransformation()}"
          ></ppp-query-select>
          <div class="spacing2"></div>
          <ppp-button
            @click="${() =>
              ppp.app.mountPage(`api-${APIS.REDIS}`, {
                size: 'xlarge',
                adoptHeader: true
              })}"
            appearance="primary"
          >
            Добавить API Redis
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Сервер</h5>
          <p class="description">
            Сервер, на котором будет запущен Aspirant. Нельзя изменить после
            создания сервиса.
          </p>
        </div>
        <div class="input-group">
          <ppp-query-select
            ${ref('serverId')}
            ?disabled="${(x) => x.document._id}"
            @change="${(x, c) => {
              // Reset domain on server change
              x.scratch.set('server', x.serverId.datum() ?? x.document.server);

              if (x.serverId.value !== x.document.serverId) {
                x.domain.value = void 0;
                x.tailnetDomain.value = '';
                x.document.serverId = x.serverId.value;
              }
            }}"
            value="${(x) => x.document.serverId}"
            :context="${(x) => x}"
            :preloaded="${(x) => x.document.server ?? ''}"
            :query="${() => {
              return (context) => {
                return context.services
                  .get('mongodb-atlas')
                  .db('ppp')
                  .collection('servers')
                  .find({
                    $or: [
                      { removed: { $ne: true } },
                      { _id: `[%#this.document.serverId ?? ''%]` }
                    ]
                  })
                  .sort({ updatedAt: -1 });
              };
            }}"
            :transform="${() => ppp.decryptDocumentsTransformation()}"
          ></ppp-query-select>
          <div class="spacing2"></div>
          <ppp-button
            ?disabled="${(x) => x.document._id}"
            @click="${() =>
              ppp.app.mountPage('server', {
                size: 'xlarge',
                adoptHeader: true
              })}"
            appearance="primary"
          >
            Добавить сервер
          </ppp-button>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Домен глобальной сети</h5>
          <p class="description">
            Опциональный домен, чтобы сгенерировать сертификаты.
          </p>
        </div>
        <div class="input-group">
          <ppp-select
            deselectable
            ?disabled="${(x) =>
              !x.serverId.value || !x.scratch.get('server')?.domains}"
            placeholder="Опционально, нажмите для выбора"
            value="${(x) => x.document.domain ?? ''}"
            ${ref('domain')}
          >
            ${repeat(
              (x) => x.scratch.get('server')?.domains ?? [],
              html` <ppp-option value="${(x) => x}">${(x) => x}</ppp-option> `
            )}
          </ppp-select>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Домен Tailnet</h5>
          <p class="description">Домен сервера в сети Tailscale.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="domain.ts.net"
            value="${(x) => x.document.tailnetDomain}"
            ${ref('tailnetDomain')}
          ></ppp-text-field>
        </div>
      </section>
      ${documentPageFooterPartial({
        text: 'Сохранить в PPP и развернуть на сервере',
        extraControls: html`
          <div class="control-line extra-controls">
            <ppp-button
              ?hidden="${(x) => !x.document._id}"
              ?disabled="${(x) => !x.isSteady() || x.document.removed}"
              @click="${(x) => x.updateTailnetCerts()}"
            >
              Обновить сертификаты Tailnet
            </ppp-button>
          </div>
          ${servicePageFooterExtraControls}
        `
      })}
    </form>
  </template>
`;

export const serviceSystemdPppAspirantStyles = css`
  ${pageStyles}
  .extra-controls {
    margin-right: auto;
  }
`;

export class ServiceSystemdPppAspirantPage extends Page {
  collection = 'services';

  async validate() {
    await validate(this.name);
    await validate(this.redisApiId);
    await validate(this.serverId);
    await validate(this.tailnetDomain);
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.collection%]')
        .aggregate([
          {
            $match: {
              _id: new BSON.ObjectId('[%#payload.documentId%]'),
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).SERVICES.SYSTEMD_PPP_ASPIRANT%]`
            }
          },
          {
            $lookup: {
              from: 'apis',
              localField: 'redisApiId',
              foreignField: '_id',
              as: 'redisApi'
            }
          },
          {
            $unwind: '$redisApi'
          },
          {
            $lookup: {
              from: 'servers',
              localField: 'serverId',
              foreignField: '_id',
              as: 'server'
            }
          },
          {
            $unwind: '$server'
          }
        ]);
    };
  }

  async find() {
    return {
      type: SERVICES.SYSTEMD_PPP_ASPIRANT,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async updateTailnetCerts() {
    if (
      await ppp.app.confirm(
        'Обновление сертификатов Tailnet',
        `Будут обновлены сертификаты сервера в сети Tailnet. Подтвердите действие.`
      )
    ) {
      this.beginOperation();

      try {
        await validate(this.tailnetDomain);

        const tailnetDomain = this.tailnetDomain.value.trim();

        if (
          !(await this.executeSSHCommands({
            server: this.serverId.datum(),
            commands: [
              `sudo mkdir -p /usr/lib/nginx/certs/${tailnetDomain} ;`,
              `sudo /bin/sh -c 'cd /usr/lib/nginx/certs/${tailnetDomain} && tailscale cert ${tailnetDomain}' ;`,
              `sudo chmod 644 /usr/lib/nginx/certs/${tailnetDomain}/${tailnetDomain}.crt ;`,
              `sudo chmod 644 /usr/lib/nginx/certs/${tailnetDomain}/${tailnetDomain}.key && `
            ].join(' ')
          }))
        ) {
          invalidate(ppp.app.toast, {
            errorMessage: 'Не удалось настроить сервис Aspirant.',
            raiseException: true
          });
        }
      } finally {
        this.endOperation();
      }
    }
  }

  #getEnvironment() {
    const redisApi = this.redisApiId.datum();

    return {
      ASPIRANT_ID: this.document._id,
      GLOBAL_PROXY_URL: ppp.keyVault.getKey('global-proxy-url'),
      REDIS_HOST: redisApi.host,
      REDIS_PORT: redisApi.port.toString(),
      REDIS_TLS: !!redisApi.tls ? 'true' : '',
      REDIS_USERNAME: redisApi.username?.toString() ?? 'default',
      REDIS_PASSWORD: redisApi.password?.toString(),
      REDIS_DATABASE: redisApi.database.toString(),
      DOCKERIZED: 'true'
    };
  }

  async #deployOnServer() {
    const domain = this.domain.value.trim();
    const tailnetDomain = this.tailnetDomain.value.trim();
    const sslReplacement = [];

    sslReplacement.push('listen 8080;');
    sslReplacement.push('listen 443 ssl;');
    sslReplacement.push('listen [::]:443 ssl;');
    sslReplacement.push(
      `ssl_certificate /usr/lib/nginx/certs/${tailnetDomain}/${tailnetDomain}.crt;`
    );
    sslReplacement.push(
      `ssl_certificate_key /usr/lib/nginx/certs/${tailnetDomain}/${tailnetDomain}.key;`
    );
    sslReplacement.push('ssl_session_timeout 1d;');
    sslReplacement.push('ssl_session_tickets off;');
    sslReplacement.push('ssl_protocols TLSv1.3;');
    sslReplacement.push('ssl_prefer_server_ciphers off;');
    sslReplacement.push('ssl_stapling on;');
    sslReplacement.push('ssl_stapling_verify on;');
    sslReplacement.push(`allow 100.0.0.0/8;`);
    sslReplacement.push('deny all;');

    const rootUrl = ppp.rootUrl.replace('github.io.dev', 'pages.dev');
    const vendorCopyCommands = [
      '/ppp/vendor/canvas/index.js',
      '/ppp/vendor/canvas/canvas-table/default-options.mjs',
      '/ppp/vendor/canvas/canvas-table/index.mjs',
      ...[
        ...[
          'Roboto-Black.ttf',
          'RobotoCondensed-Bold.ttf',
          'RobotoCondensed-LightItalic.ttf',
          'Roboto-LightItalic.ttf',
          'Roboto-Thin.ttf',
          'Roboto-BlackItalic.ttf',
          'RobotoCondensed-BoldItalic.ttf',
          'RobotoCondensed-Regular.ttf',
          'Roboto-Medium.ttf',
          'Roboto-ThinItalic.ttf',
          'Roboto-Bold.ttf',
          'RobotoCondensed-Italic.ttf',
          'Roboto-Italic.ttf',
          'Roboto-MediumItalic.ttf',
          'Roboto-BoldItalic.ttf',
          'RobotoCondensed-Light.ttf',
          'Roboto-Light.ttf',
          'Roboto-Regular.ttf'
        ].map((file) => `/ppp/vendor/canvas/fonts/${file}`)
      ],
      ...[
        'bindings.js',
        'canvas.js',
        'context2d.js',
        'DOMMatrix.js',
        'image.js',
        'jpegstream.js',
        'parse-font.js',
        'pattern.js',
        'pdfstream.js',
        'pngstream.js'
      ].map((file) => `/ppp/vendor/canvas/lib/${file}`),
      '/ppp/vendor/canvas/linux-arm64-111/canvas.node',
      '/ppp/vendor/canvas/linux-x64-111/canvas.node',
      ...[
        'buffer-util.mjs',
        'event-target.mjs',
        'limiter.mjs',
        'receiver.mjs',
        'validation.mjs',
        'constants.mjs',
        'extension.mjs',
        'permessage-deflate.mjs',
        'sender.mjs',
        'websocket.mjs'
      ].map((file) => `/ppp/vendor/websocket/${file}`),
      '/ppp/vendor/uWebSockets.js/uws_linux_arm64_115.node',
      '/ppp/vendor/uWebSockets.js/uws_linux_arm_115.node',
      '/ppp/vendor/uWebSockets.js/uws_linux_x64_115.node',
      '/ppp/vendor/uWebSockets.js/uws.js',
      '/ppp/vendor/ioredis.min.js'
    ].map(
      (path) =>
        `sudo wget -q -O ${path} ${rootUrl}${path.replace(/^\/ppp/, '')} ;`
    );

    const serviceFilename = `aspirant@${this.document._id}`;
    const serviceFile = [
      '[Unit]',
      'Description=PPP Aspirant service (%i)',
      'After=network-online.target',
      '[Service]',
      'Type=simple',
      'User=root'
    ];

    if (domain) {
      serviceFile.push(
        ...[
          'ExecStartPre=+/usr/bin/mkdir -p /usr/lib/nginx/certs/%i',
          `ExecStartPre=+/bin/cp /etc/letsencrypt/live/${domain}/fullchain.pem /usr/lib/nginx/certs/%i/fullchain.pem`,
          `ExecStartPre=+/bin/cp /etc/letsencrypt/live/${domain}/chain.pem /usr/lib/nginx/certs/%i/chain.pem`,
          `ExecStartPre=+/bin/cp /etc/letsencrypt/live/${domain}/privkey.pem /usr/lib/nginx/certs/%i/privkey.pem`,
          `ExecStartPre=+/bin/chmod 644 /usr/lib/nginx/certs/%i/fullchain.pem`,
          `ExecStartPre=+/bin/chmod 644 /usr/lib/nginx/certs/%i/privkey.pem`,
          `ExecStartPre=+/bin/chmod 644 /usr/lib/nginx/certs/%i/chain.pem`
        ]
      );
    }

    const environment = [];
    const obj = this.#getEnvironment();

    for (const key in obj) {
      environment.push(`Environment="${key}=${obj[key]}"`);
    }

    serviceFile.push(
      ...[
        'ExecStart=/usr/sbin/start-aspirant.sh',
        'PrivateTmp=yes',
        'NoNewPrivileges=yes',
        'WorkingDirectory=/ppp/lib',
        ...environment,
        'KillSignal=2',
        'RestartSec=1s',
        'Restart=always',
        '[Install]',
        'WantedBy=multi-user.target'
      ]
    );

    const commands = [
      // Users
      'sudo groupadd -f ppp ;',
      'sudo useradd -g ppp ppp || true ;',
      'sudo groupadd -f --system --gid 101 nginx ;',
      'sudo useradd --system --gid nginx --no-create-home --home /nonexistent --comment "nginx user" --shell /bin/false --uid 101 nginx || true ;',

      // aspirant
      'sudo mkdir -p /ppp/lib/aspirant ;',
      `sudo wget -q -O /ppp/lib/aspirant/buddy.mjs ${rootUrl}/lib/aspirant/buddy.mjs ;`,
      `sudo wget -q -O /ppp/lib/aspirant/start.sh ${rootUrl}/lib/aspirant/start.sh ;`,
      `sudo sed -i 's\\etc/consul\\etc/consul.d\\g' /ppp/lib/aspirant/start.sh ;`,

      // SELinux
      `sudo /bin/cp -f /ppp/lib/aspirant/start.sh /usr/sbin/start-aspirant.sh ;`,
      'sudo chmod +x /usr/sbin/start-aspirant.sh ;',

      // ngx-unzip
      'sudo mkdir -p /ppp/lib/nginx/ngx-unzip ;',
      `sudo wget -q -O /ppp/lib/nginx/ngx-utils.h ${rootUrl}/lib/nginx/ngx-utils.h ;`,
      `sudo wget -q -O /ppp/lib/nginx/ngx-utils.c ${rootUrl}/lib/nginx/ngx-utils.c ;`,
      `sudo wget -q -O /ppp/lib/nginx/ngx-unzip/config ${rootUrl}/lib/nginx/ngx-unzip/config ;`,
      `sudo wget -q -O /ppp/lib/nginx/ngx-unzip/miniz.h ${rootUrl}/lib/nginx/ngx-unzip/miniz.h ;`,
      `sudo wget -q -O /ppp/lib/nginx/ngx-unzip/ngx_http_unzip_module.c ${rootUrl}/lib/nginx/ngx-unzip/ngx_http_unzip_module.c ;`,
      `sudo wget -q -O /ppp/lib/nginx/ngx-unzip/zip.c ${rootUrl}/lib/nginx/ngx-unzip/zip.c ;`,
      `sudo wget -q -O /ppp/lib/nginx/ngx-unzip/zip.h ${rootUrl}/lib/nginx/ngx-unzip/zip.h ;`,

      // vendor
      'sudo mkdir -p /ppp/vendor/canvas ;',
      'sudo mkdir -p /ppp/vendor/canvas/canvas-table ;',
      'sudo mkdir -p /ppp/vendor/canvas/fonts ;',
      'sudo mkdir -p /ppp/vendor/canvas/lib ;',
      'sudo mkdir -p /ppp/vendor/canvas/linux-arm64-111 ;',
      'sudo mkdir -p /ppp/vendor/canvas/linux-x64-111 ;',
      'sudo mkdir -p /ppp/vendor/uWebSockets.js ;',
      'sudo mkdir -p /ppp/vendor/websocket ;',
      ...vendorCopyCommands,

      // node
      'sudo mkdir -p /opt/ppp ;',
      'if [ $(uname -p) == "x86_64" ]; then cpuarch="x64"; else cpuarch="arm64"; fi ;',
      'if [ ! -d /opt/ppp/node-v20.13.1-linux-${cpuarch} ]; then sudo wget -qO- https://nodejs.org/dist/v20.13.1/node-v20.13.1-linux-${cpuarch}.tar.xz | sudo tar -xJ -C /opt/ppp ; fi ;',
      'sudo ln -fs /opt/ppp/node-v20.13.1-linux-${cpuarch}/bin/node /usr/local/bin/node ;',
      'sudo ln -fs /opt/ppp/node-v20.13.1-linux-${cpuarch}/bin/npm /usr/local/bin/npm ;',
      '/usr/local/bin/npm config set prefix /usr ;',

      // firewalld
      `sudo firewall-cmd --permanent --zone=trusted --add-source=100.0.0.0/8 ;`,
      `sudo firewall-cmd --permanent --add-service=http ;`,
      `sudo firewall-cmd --permanent --add-service=https ;`,
      `sudo firewall-cmd --reload ;`,

      // Fury repo
      `sudo wget -q -O /etc/yum.repos.d/fury.repo ${rootUrl}/vendor/fury.repo`,
      'sudo dnf clean dbcache ;',

      // Consul
      `sudo dnf -y install consul ;`,
      'sudo rm -f /etc/consul.d/consul.hcl ;',
      `sudo wget -q -O /etc/consul.d/server.json ${rootUrl}/lib/aspirant/etc/consul/server.json ;`,
      'sudo chown consul /etc/consul.d/server.json ;',
      'sudo systemctl disable consul ;',

      // Nomad
      `sudo dnf -y install nomad ;`,
      'sudo rm -f /etc/nomad.d/nomad.hcl ;',
      `sudo wget -q -O /etc/nomad.d/server.hcl ${rootUrl}/lib/aspirant/etc/nomad.d/server.hcl ;`,
      'sudo chown -R ppp /etc/nomad.d ;',
      'sudo systemctl disable nomad ; ',

      // nginx & njs
      'sudo wget https://nginx.org/download/nginx-1.25.3.tar.gz -q -O nginx.tar.gz ;',
      'sudo rm -rf /usr/src/nginx && sudo mkdir -p /usr/src/nginx && sudo tar -zxC /usr/src/nginx -f nginx.tar.gz --strip-components=1 ;',
      'sudo dnf -y install pcre pcre2 pcre-devel pcre2-devel libxml2 libxml2-devel libxslt libxslt-devel ;',
      'sudo mkdir -p /etc/nginx/njs/api ;',
      'sudo mkdir -p /usr/lib/nginx ;',
      'sudo mkdir -p /usr/lib/nginx/logs ;',
      `sudo wget -q -O /etc/nginx/nginx.conf ${rootUrl}/lib/aspirant/etc/nginx/nginx.conf ;`,
      `sudo wget -q -O /etc/nginx/njs/api/v1.js ${rootUrl}/lib/aspirant/etc/nginx/njs/api/v1.js ;`,
      `sudo sed -i 's\\listen 80;\\${sslReplacement.join(
        ' '
      )}\\g' /etc/nginx/nginx.conf ;`,
      'sudo chown -R nginx /etc/nginx ;',
      'sudo rm -rf /usr/src/njs ; ',
      'cd /usr/src && sudo git clone https://github.com/nginx/njs.git ;',
      `sudo /bin/sh -c 'cd /usr/src/nginx && ./configure --prefix=/usr/lib/nginx --sbin-path=/usr/sbin/nginx --conf-path=/etc/nginx/nginx.conf --pid-path=/usr/lib/nginx/nginx.pid --with-http_ssl_module --with-stream --with-pcre --with-compat --add-dynamic-module=/ppp/lib/nginx/ngx-unzip --add-dynamic-module=/usr/src/njs/nginx' ;`,
      `sudo /bin/sh -c 'cd /usr/src/nginx && make -j$(nproc)' ;`,
      `sudo /bin/cp -f /usr/src/nginx/objs/ngx_http_js_module.so /usr/lib/nginx/modules/ngx_http_js_module.so ;`,
      `sudo /bin/cp -f /usr/src/nginx/objs/ngx_stream_js_module.so /usr/lib/nginx/modules/ngx_stream_js_module.so ;`,
      `sudo /bin/cp -f /usr/src/nginx/objs/ngx_http_unzip_module.so /usr/lib/nginx/modules/ngx_http_unzip_module.so ;`,
      `sudo /bin/cp -f /usr/src/nginx/objs/nginx /usr/sbin/nginx ;`,

      // Tailnet certificates
      `sudo mkdir -p /usr/lib/nginx/certs/${tailnetDomain} ;`,
      `/bin/sh -c 'cd /usr/lib/nginx/certs/${tailnetDomain} && tailscale cert ${tailnetDomain}' ;`,
      `chmod 644 /usr/lib/nginx/certs/${tailnetDomain}/${tailnetDomain}.crt ;`,
      `chmod 644 /usr/lib/nginx/certs/${tailnetDomain}/${tailnetDomain}.key ;`,

      // Aspirant systemd
      `sudo tee /etc/systemd/system/${serviceFilename}.service <<EOF \n${serviceFile.join(
        '\n'
      )}\nEOF\n`,
      'sudo systemctl daemon-reload ;',
      'sudo systemctl reset-failed ;',
      `sudo systemctl enable ${serviceFilename}.service ;`,
      `sudo systemctl restart ${serviceFilename}.service && `
    ].join(' ');

    if (
      !(await this.executeSSHCommands({
        server: this.serverId.datum(),
        commands,
        commandsToDisplay: commands.replace(
          /"REDIS_PASSWORD=[\s\S]+?"/gi,
          '"REDIS_PASSWORD=<hidden content>"'
        )
      }))
    ) {
      invalidate(ppp.app.toast, {
        errorMessage: 'Не удалось настроить сервис Aspirant.',
        raiseException: true
      });
    }
  }

  async submit() {
    return [
      {
        $set: {
          name: this.name.value.trim(),
          redisApiId: this.redisApiId.value,
          serverId: this.serverId.value,
          domain: this.domain.value,
          tailnetDomain: this.tailnetDomain.value.trim(),
          version: 1,
          state: SERVICE_STATE.FAILED,
          updatedAt: new Date()
        },
        $setOnInsert: {
          type: SERVICES.SYSTEMD_PPP_ASPIRANT,
          createdAt: new Date()
        }
      },
      this.#deployOnServer,
      () => ({
        $set: {
          state: SERVICE_STATE.ACTIVE,
          updatedAt: new Date()
        }
      })
    ];
  }

  async restart() {
    if (
      !(await this.executeSSHCommands({
        server: this.document.server,
        commands: `sudo systemctl restart aspirant@${this.document._id}.service &&`
      }))
    ) {
      invalidate(ppp.app.toast, {
        errorMessage: 'Не удалось перезапустить сервис Aspirant.',
        raiseException: true
      });
    }
  }

  async stop() {
    if (
      !(await this.executeSSHCommands({
        server: this.document.server,
        commands: `sudo systemctl stop aspirant@${this.document._id}.service &&`
      }))
    ) {
      invalidate(ppp.app.toast, {
        errorMessage: 'Не удалось остановить сервис Aspirant.',
        raiseException: true
      });
    }
  }

  async cleanup() {
    if (
      !(await this.executeSSHCommands({
        server: this.document.server,
        commands: [
          `sudo systemctl stop aspirant@${this.document._id}.service ;`,
          `sudo systemctl disable aspirant@${this.document._id}.service ;`,
          `sudo rm -f /etc/systemd/system/aspirant@${this.document._id}.service`,
          `sudo rm -f /ppp`,
          `sudo rm -f /usr/sbin/start-aspirant.sh`,
          'sudo systemctl daemon-reload ;',
          'sudo systemctl reset-failed && '
        ].join(' ')
      }))
    ) {
      invalidate(ppp.app.toast, {
        errorMessage: 'Не удалось остановить сервис Aspirant.',
        raiseException: true
      });
    }
  }
}

applyMixins(
  ServiceSystemdPppAspirantPage,
  PageWithService,
  PageWithSSHTerminal
);

export default ServiceSystemdPppAspirantPage.compose({
  template: serviceSystemdPppAspirantTemplate,
  styles: serviceSystemdPppAspirantStyles
}).define();
