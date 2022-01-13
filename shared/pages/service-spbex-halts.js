/** @decorator */

import { PageWithTerminal } from '../page.js';
import { validate } from '../validate.js';
import { FetchError } from '../fetch-error.js';
import { uuidv4 } from '../ppp-crypto.js';
import { SUPPORTED_APIS, SUPPORTED_SERVICES } from '../const.js';
import { Observable, observable } from '../element/observation/observable.js';

export class ServiceSpbexHaltsPage extends PageWithTerminal {
  @observable
  service;

  @observable
  bots;

  @observable
  servers;

  @observable
  apis;

  getConnectionString(api) {
    const { hostname } = new URL(api.url);

    return `postgres://${api.user}:${encodeURIComponent(
      api.password
    )}@db.${hostname}:${api.port}/${api.db}`;
  }

  async sendTestSpbexHaltMessage() {
    this.beginOperation();

    try {
      await validate(this.api);
      await validate(this.server);
      await validate(this.bot);
      await validate(this.codeArea);
      await validate(this.channel);

      const functionBody = this.codeArea.code.match(/\$\$([\s\S]+?)\$\$/i)?.[1];

      if (functionBody) {
        const temporaryFunction = `function _format_spbex_halt_message(isin,
          ticker, name, currency, date, url, start, finish){${functionBody}}`;

        const bot = Object.assign(
          {},
          this.bots.find((b) => b.uuid === this.bot.value)
        );

        bot.token = await this.app.ppp.crypto.decrypt(bot.iv, bot.token);

        const query = `do $$
           ${temporaryFunction}

           plv8.execute(\`select content from http_post('https://api.telegram.org/bot${bot.token}/sendMessage',
          'chat_id=${this.channel.value}&text=\${_format_spbex_halt_message('US0400476075', 'ARNA',
          'Arena Pharmaceuticals, Inc.', 'USD', '13.12.2021 14:42', 'https://spbexchange.ru/ru/about/news.aspx?section=17&news=27044',
          '14:45', '15:15')}&parse_mode=html', 'application/x-www-form-urlencoded')\`); $$ language plv8`;

        const api = Object.assign(
          {},
          this.apis.find((a) => a.uuid === this.api.value)
        );

        api.password = await this.app.ppp.crypto.decrypt(api.iv, api.password);

        const rTestSQL = await fetch(
          new URL(
            'pg',
            this.app.ppp.keyVault.getKey('service-machine-url')
          ).toString(),
          {
            cache: 'no-cache',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              query,
              connectionString: this.getConnectionString(api)
            })
          }
        );

        if (!rTestSQL.ok)
          // noinspection ExceptionCaughtLocallyJS
          throw new FetchError({
            ...rTestSQL,
            ...{ message: await rTestSQL.text() }
          });

        this.succeedOperation('Сообщение отправлено.');
      } else {
        // Invalid function
        this.failOperation(422);
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async connectedCallback() {
    super.connectedCallback();

    const service = this.app.params()?.service;

    this.bots = null;
    this.apis = null;

    this.beginOperation();

    try {
      if (service) {
        this.service = await this.app.ppp.user.functions.findOne(
          {
            collection: 'services'
          },
          {
            uuid: service
          }
        );

        if (!this.service) {
          this.failOperation(404);
        }
      }

      // TODO - filters
      [this.bots, this.servers, this.apis] = await Promise.all([
        this.app.ppp.user.functions.aggregate(
          {
            collection: 'bots'
          },
          [
            {
              $match: {
                $or: [
                  { removed: { $not: { $eq: true } } },
                  { uuid: { $eq: this.service?.bot_uuid } }
                ]
              }
            }
          ]
        ),
        this.app.ppp.user.functions.find({
          collection: 'servers'
        }),
        this.app.ppp.user.functions.find(
          {
            collection: 'apis'
          },
          {
            type: SUPPORTED_APIS.SUPABASE
          }
        )
      ]);

      if (!this.bots.length) this.bots = void 0;

      if (!this.servers.length) this.servers = void 0;

      if (!this.apis.length) this.apis = void 0;
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  getSQLUrl(file) {
    const origin = window.location.origin;
    let scriptUrl = new URL(`sql/${file}`, origin).toString();

    if (origin.endsWith('github.io'))
      scriptUrl = new URL(`ppp/sql/${file}`, origin).toString();

    return scriptUrl;
  }

  async sql() {
    const [spbexStocks, sendTelegramMessage, spbexHalts] = await Promise.all([
      fetch(this.getSQLUrl('spbex-stocks.sql')).then((r) => r.text()),
      fetch(this.getSQLUrl('send-telegram-message.sql')).then((r) => r.text()),
      fetch(this.getSQLUrl('spbex-halts.sql')).then((r) => r.text())
    ]);

    const bot = Object.assign(
      {},
      this.bots.find((b) => b.uuid === this.bot.value)
    );

    return `
      ${spbexStocks}
      ${sendTelegramMessage}
      ${spbexHalts}

      create or replace function send_telegram_message_for_spbex_halt(msg text)
      returns json as
      $$
        return plv8.find_function('send_telegram_message')('${
          this.channel.value
        }',
          '${await this.app.ppp.crypto.decrypt(bot.iv, bot.token)}', msg);
      $$ language plv8;

      ${this.codeArea.value}
      `;
  }

  async commands(uuid, api) {
    let interval = parseInt(this.interval.value);

    if (interval < 1 || isNaN(interval)) interval = 5;

    const curlExpression = `-X POST --header "apiKey: ${api.key}" ${new URL(
      'rest/v1/rpc/process_spbex_halts',
      api.url
    ).toString()}`;

    const servicePillar = JSON.stringify({
      service_name: `ppp@${uuid}`,
      service_type: SUPPORTED_SERVICES.SPBEX_HALTS,
      service_systemd_type: 'oneshot',
      exec_start: `/usr/bin/curl --silent ${curlExpression}`
    });

    const timerPillar = JSON.stringify({
      service_name: `ppp@${uuid}`,
      service_type: SUPPORTED_SERVICES.SPBEX_HALTS,
      on_unit_inactive_sec: `${interval}s`
    });

    return [
      'sudo salt-call --local state.sls epel ;',
      'sudo salt-call --local state.sls ppp ;',
      `sudo salt-call --local state.sls systemd.service pillar='${servicePillar}' ;`,
      `sudo salt-call --local state.sls systemd.timer pillar='${timerPillar}' ;`,
      `[ "$(sudo systemctl is-active ppp@${uuid}.service)" == "failed" ] && exit 1 || `
    ].join(' ');
  }

  async install() {
    this.beginOperation();

    try {
      await validate(this.serviceName);
      await validate(this.api);
      await validate(this.server);
      await validate(this.interval);
      await validate(this.bot);
      await validate(this.codeArea);
      await validate(this.channel);

      let interval = parseInt(this.interval.value);

      if (interval < 1 || isNaN(interval)) interval = 5;

      let uuid;

      if (!this.service) {
        uuid = uuidv4();

        await this.app.ppp.user.functions.insertOne(
          {
            collection: 'services'
          },
          {
            _id: this.serviceName.value.trim(),
            uuid,
            state: 'failed',
            type: SUPPORTED_SERVICES.SPBEX_HALTS,
            version: 1,
            created_at: new Date(),
            updated_at: new Date(),
            api_uuid: this.api.value,
            server_uuid: this.server.value,
            interval,
            bot_uuid: this.bot.value,
            code: this.codeArea.value,
            channel: +this.channel.value
          }
        );
      } else uuid = this.service.uuid;

      this.busy = false;
      this.terminalModal.visible = true;

      const terminal = this.terminalDom.terminal;

      terminal.clear();
      terminal.reset();
      terminal.writeInfo('Выполняется запрос к базе данных...\r\n', true);

      this.progressOperation(0);

      const sql = await this.sql();

      this.progressOperation(10);

      const api = Object.assign(
        {},
        this.apis.find((a) => a.uuid === this.api.value)
      );

      api.password = await this.app.ppp.crypto.decrypt(api.iv, api.password);
      api.key = await this.app.ppp.crypto.decrypt(api.iv, api.key);

      const rSQL = await fetch(
        new URL(
          'pg',
          this.app.ppp.keyVault.getKey('service-machine-url')
        ).toString(),
        {
          cache: 'no-cache',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: sql,
            connectionString: this.getConnectionString(api)
          })
        }
      );

      const message = await rSQL.text();

      if (!rSQL.ok) {
        terminal.writeError(message);

        // noinspection ExceptionCaughtLocallyJS
        throw new FetchError({ ...rSQL, ...{ message } });
      } else terminal.writeln(message);

      terminal.writeln('');

      const commands = await this.commands(uuid, api);
      const ok = await this.executeSSHCommand({
        serverUuid: this.server.value,
        commands,
        commandsToDisplay: commands.replace(
          /apiKey: ([\s\S]+?)"/,
          'apiKey: <hidden token>"'
        ),
        progress: 50,
        clearTerminal: false
      });

      await this.app.ppp.user.functions.updateOne(
        {
          collection: 'services'
        },
        {
          _id: this.serviceName.value.trim()
        },
        {
          $set: {
            state: ok ? 'active' : 'failed',
            version: 1,
            updated_at: new Date(),
            api_uuid: this.api.value,
            server_uuid: this.server.value,
            interval,
            bot_uuid: this.bot.value,
            code: this.codeArea.value,
            channel: +this.channel.value
          }
        }
      );

      if (ok) {
        this.succeedOperation();
      } else {
        this.failOperation(520);
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.terminalModal.dismissible = true;

      this.endOperation();
    }
  }

  async restart() {
    this.beginOperation('Перезапуск сервиса');

    try {
      const commands = [
        `sudo systemctl restart ppp@${this.service.uuid}.timer &&`
      ].join(' ');

      const ok = await this.executeSSHCommand({
        serverUuid: this.server.uuid,
        commands,
        commandsToDisplay: commands
      });

      if (ok) {
        this.service.state = 'active';
        Observable.notify(this, 'service');

        await this.app.ppp.user.functions.updateOne(
          {
            collection: 'services'
          },
          {
            _id: this.service._id
          },
          {
            $set: {
              state: 'active',
              updated_at: new Date()
            }
          }
        );

        this.succeedOperation();
      } else {
        this.failOperation(520);
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.terminalModal.dismissible = true;

      this.endOperation();
    }
  }

  async stop() {
    this.beginOperation('Остановка сервиса');

    try {
      const commands = [
        `sudo systemctl stop ppp@${this.service.uuid}.timer &&`
      ].join(' ');

      const ok = await this.executeSSHCommand({
        serverUuid: this.server.uuid,
        commands,
        commandsToDisplay: commands
      });

      if (ok) {
        this.service.state = 'stopped';
        Observable.notify(this, 'service');

        await this.app.ppp.user.functions.updateOne(
          {
            collection: 'services'
          },
          {
            _id: this.service._id
          },
          {
            $set: {
              state: 'stopped',
              updated_at: new Date()
            }
          }
        );

        this.succeedOperation();
      } else {
        this.failOperation(520);
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.terminalModal.dismissible = true;

      this.endOperation();
    }
  }

  async remove() {
    this.beginOperation('Удаление сервиса');

    try {
      const commands = [
        `sudo systemctl disable ppp@${this.service.uuid}.service ;`,
        `sudo systemctl disable ppp@${this.service.uuid}.timer ;`,
        `sudo systemctl stop ppp@${this.service.uuid}.timer ;`,
        `sudo rm -f /etc/systemd/system/ppp@${this.service.uuid}.service ;`,
        `sudo rm -f /etc/systemd/system/ppp@${this.service.uuid}.timer ;`,
        'sudo systemctl daemon-reload &&'
      ].join(' ');

      const ok = await this.executeSSHCommand({
        serverUuid: this.server.uuid,
        commands,
        commandsToDisplay: commands
      });

      if (ok) {
        this.service.removed = true;
        this.service.state = 'stopped';
        Observable.notify(this, 'service');

        await this.app.ppp.user.functions.updateOne(
          {
            collection: 'services'
          },
          {
            _id: this.service._id
          },
          {
            $set: {
              state: 'stopped',
              removed: true,
              updated_at: new Date()
            }
          }
        );

        this.succeedOperation();
      } else {
        this.failOperation(520);
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.terminalModal.dismissible = true;

      this.endOperation();
    }
  }
}
