/** @decorator */

import { SystemdTimerWithSupabasePage } from '../page.js';
import { validate } from '../validate.js';
import { FetchError, maybeFetchError } from '../fetch-error.js';
import { uuidv4 } from '../ppp-crypto.js';
import { SUPPORTED_APIS, SUPPORTED_SERVICES } from '../const.js';
import { Observable, observable } from '../element/observation/observable.js';
import { Tmpl } from '../tmpl.js';

export class ServiceSpbexHaltsPage extends SystemdTimerWithSupabasePage {
  @observable
  bots;

  async callInstrumentsFunction() {
    this.beginOperation();

    try {
      await validate(this.api);
      await validate(this.instrumentsCode);

      const funcName = `pg_temp.ppp_${uuidv4().replaceAll('-', '_')}`;
      // Temporary function, no need to drop
      const query = `create or replace function ${funcName}()
        returns json as
        $$
          ${this.instrumentsCode.code}
        $$ language plv8;

        select ${funcName}();
        `;

      const api = Object.assign(
        {},
        this.apis.find((a) => a._id === this.api.value)
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

      await maybeFetchError(rTestSQL);

      console.table(
        JSON.parse(
          (await rTestSQL.json()).results.find(
            (r) => r.command.toUpperCase() === 'SELECT'
          ).rows[0]
        )
      );

      this.succeedOperation(
        'База данных выполнила функцию успешно. Смотрите результат в консоли браузера.'
      );
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async sendTestSpbexHaltMessage() {
    this.beginOperation();

    try {
      await validate(this.api);
      await validate(this.bot);
      await validate(this.formatterCode);
      await validate(this.channel);

      const funcName = `ppp_${uuidv4().replaceAll('-', '_')}`;

      const temporaryFunction = `function ${funcName}(isin,
        ticker, name, currency, date, url, start, finish) {
          ${this.formatterCode.code}
        }`;

      const bot = Object.assign(
        {},
        this.bots.find((b) => b._id === this.bot.value)
      );

      bot.token = await this.app.ppp.crypto.decrypt(bot.iv, bot.token);

      const query = `do $$
           ${temporaryFunction}

           plv8.execute(\`select content from http_post('https://api.telegram.org/bot${bot.token}/sendMessage',
          'chat_id=${this.channel.value}&text=\${${funcName}('US0400476075', 'ARNA',
          'Arena Pharmaceuticals, Inc.', 'USD', '13.12.2021 14:42', 'https://spbexchange.ru/ru/about/news.aspx?section=17&news=27044',
          '14:45', '15:15')}&parse_mode=html', 'application/x-www-form-urlencoded')\`); $$ language plv8`;

      const api = Object.assign(
        {},
        this.apis.find((a) => a._id === this.api.value)
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

      await maybeFetchError(rTestSQL);
      this.succeedOperation('Сообщение отправлено.');
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async connectedCallback() {
    super.connectedCallback();

    const serviceId = this.app.params()?.service;

    this.bots = null;
    this.apis = null;
    this.servers = null;

    this.beginOperation();

    try {
      if (serviceId) {
        this.service = await this.app.ppp.user.functions.findOne(
          {
            collection: 'services'
          },
          {
            _id: serviceId,
            type: SUPPORTED_SERVICES.SPBEX_HALTS
          }
        );

        if (!this.service) {
          this.failOperation(404);

          return await this.notFound();
        } else {
          Observable.notify(this, 'service');
        }
      }

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
                  { _id: this.service?.botId }
                ]
              }
            }
          ]
        ),
        this.app.ppp.user.functions.aggregate(
          {
            collection: 'servers'
          },
          [
            {
              $match: {
                $or: [
                  { removed: { $not: { $eq: true } } },
                  { _id: this.service?.serverId }
                ]
              }
            }
          ]
        ),
        this.app.ppp.user.functions.aggregate(
          {
            collection: 'apis'
          },
          [
            {
              $match: {
                $and: [
                  {
                    type: SUPPORTED_APIS.SUPABASE
                  },
                  {
                    $or: [
                      { removed: { $not: { $eq: true } } },
                      { _id: this.service?.apiId }
                    ]
                  }
                ]
              }
            }
          ]
        )
      ]);

      if (!this.bots.length) this.bots = void 0;

      if (!this.servers.length) this.servers = void 0;

      if (!this.apis.length) this.apis = void 0;
    } catch (e) {
      this.failOperation(e);
      await this.notFound();
    } finally {
      this.endOperation();
    }
  }

  async sql(serviceId) {
    const [sendTelegramMessage, installSpbexHalts] = await Promise.all([
      fetch(this.getSQLUrl('send-telegram-message.sql')).then((r) => r.text()),
      fetch(this.getSQLUrl('install-spbex-halts.sql')).then((r) => r.text())
    ]);

    const bot = Object.assign(
      {},
      this.bots.find((b) => b._id === this.bot.value)
    );

    return `${sendTelegramMessage}
      ${await new Tmpl().render(this, installSpbexHalts, {
        serviceId,
        channel: this.channel.value,
        instrumentsCode: this.instrumentsCode.value,
        formatterCode: this.formatterCode.value,
        botToken: await this.app.ppp.crypto.decrypt(bot.iv, bot.token)
      })}`;
  }

  async commands(serviceId, api) {
    let interval = parseInt(this.interval.value);

    if (interval < 1 || isNaN(interval)) interval = 5;

    const curlExpression = `-X POST --header "apiKey: ${api.key}" ${new URL(
      `rest/v1/rpc/process_spbex_halts_${serviceId}`,
      api.url
    ).toString()}`;

    const servicePillar = JSON.stringify({
      service_name: `ppp@${serviceId}`,
      service_type: SUPPORTED_SERVICES.SPBEX_HALTS,
      service_systemd_type: 'oneshot',
      exec_start: `/usr/bin/curl --silent ${curlExpression}`
    });

    const timerPillar = JSON.stringify({
      service_name: `ppp@${serviceId}`,
      service_type: SUPPORTED_SERVICES.SPBEX_HALTS,
      on_unit_inactive_sec: `${interval}s`
    });

    return [
      'sudo salt-call --local state.sls epel ;',
      'sudo salt-call --local state.sls ppp ;',
      `sudo salt-call --local state.sls systemd.service pillar='${servicePillar}' ;`,
      `sudo salt-call --local state.sls systemd.timer pillar='${timerPillar}' ;`,
      `[ "$(sudo systemctl is-active ppp@${serviceId}.timer)" != "active" ] && exit 1 || `
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
      await validate(this.instrumentsCode);
      await validate(this.formatterCode);
      await validate(this.channel);

      let interval = parseInt(this.interval.value);

      if (interval < 1 || isNaN(interval)) interval = 5;

      let serviceId = this.service?._id;

      if (!this.service) {
        const existingService = await this.app.ppp.user.functions.findOne(
          {
            collection: 'services'
          },
          {
            removed: { $not: { $eq: true } },
            type: SUPPORTED_SERVICES.SPBEX_HALTS,
            name: this.serviceName.value.trim()
          },
          {
            _id: 1
          }
        );

        if (existingService) {
          return this.failOperation({
            href: `?page=service-${SUPPORTED_SERVICES.SPBEX_HALTS}&service=${existingService._id}`,
            error: 'E11000'
          });
        }

        const { insertedId } = await this.app.ppp.user.functions.insertOne(
          {
            collection: 'services'
          },
          {
            name: this.serviceName.value.trim(),
            state: 'failed',
            type: SUPPORTED_SERVICES.SPBEX_HALTS,
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            apiId: this.api.value,
            serverId: this.server.value,
            botId: this.bot.value,
            interval,
            instrumentsCode: this.instrumentsCode.value,
            formatterCode: this.formatterCode.value,
            channel: +this.channel.value
          }
        );

        serviceId = insertedId;
      }

      this.busy = false;
      this.terminalModal.visible = true;

      const terminal = this.terminalDom.terminal;

      terminal.clear();
      terminal.reset();
      terminal.writeInfo('Выполняется запрос к базе данных...\r\n', true);

      this.progressOperation(0);

      const sql = await this.sql(serviceId);

      this.progressOperation(10);

      const api = Object.assign(
        {},
        this.apis.find((a) => a._id === this.api.value)
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

      const commands = await this.commands(serviceId, api);
      const ok = await this.executeSSHCommand({
        serverId: this.server.value,
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
          _id: serviceId
        },
        {
          $set: {
            name: this.serviceName.value.trim(),
            state: ok ? 'active' : 'failed',
            version: 1,
            updatedAt: new Date(),
            apiId: this.api.value,
            serverId: this.server.value,
            botId: this.bot.value,
            interval,
            instrumentsCode: this.instrumentsCode.value,
            formatterCode: this.formatterCode.value,
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

  async remove() {
    return super.remove('remove-spbex-halts.sql');
  }
}
