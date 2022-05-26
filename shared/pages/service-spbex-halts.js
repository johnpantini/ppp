/** @decorator */

import { validate } from '../validate.js';
import { maybeFetchError } from '../fetch-error.js';
import { uuidv4 } from '../ppp-crypto.js';
import { SUPPORTED_APIS, SUPPORTED_SERVICES } from '../const.js';
import { observable } from '../element/observation/observable.js';
import { Tmpl } from '../tmpl.js';
import { SupabaseParserPage } from '../supabase-parser-page.js';

export class ServiceSpbexHaltsPage extends SupabaseParserPage {
  @observable
  bots;

  @observable
  apis;

  type = SUPPORTED_SERVICES.SPBEX_HALTS;

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
      const api = this.apis.find((a) => a._id === this.api.value);
      const password = await this.app.ppp.crypto.decrypt(api.iv, api.password);
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
            connectionString: this.getConnectionString(
              Object.assign({}, api, { password })
            )
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

      // Returns form data
      const temporaryFunction = `function ${funcName}(isin,
        ticker, name, currency, date, url, start, finish) {
          const closure = () => {${this.formatterCode.code}};
          const formatted = closure();

          if (typeof formatted === 'string')
            return \`chat_id=${this.channel.value}&text=\${formatted}&parse_mode=html\`;
          else {
            const options = formatted.options || {};
            let formData = \`chat_id=${this.channel.value}&text=\${formatted.text}\`;

            if (typeof options.parse_mode === 'undefined')
              formData += '&parse_mode=html';

            if (typeof options.entities !== 'undefined')
              formData += \`&entities=\${encodeURIComponent(options.entities)}\`;

            if (options.disable_web_page_preview === true)
              formData += '&disable_web_page_preview=true';

            if (options.disable_notification === true)
              formData += '&disable_notification=true';

            if (options.protect_content === true)
              formData += '&protect_content=true';

            if (typeof options.reply_markup !== 'undefined')
              formData += \`&reply_markup=\${encodeURIComponent(options.reply_markup)}\`;

            return formData;
          }
        }`;

      const bot = Object.assign(
        {},
        this.bots.find((b) => b._id === this.bot.value)
      );

      bot.token = await this.app.ppp.crypto.decrypt(bot.iv, bot.token);

      const query = `do $$
         ${temporaryFunction}

         plv8.execute(\`select content from http_post('https://api.telegram.org/bot${bot.token}/sendMessage',
        '\${${funcName}('US0400476075', 'ARNA', 'Arena Pharmaceuticals, Inc.', 'USD', '13.12.2021 14:42',
        'https://spbexchange.ru/ru/about/news.aspx?section=17&news=27044', '14:45', '15:15')}',
        'application/x-www-form-urlencoded')\`); $$ language plv8`;

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

      await maybeFetchError(
        rTestSQL,
        'Не удалось отправить тестовое сообщение.'
      );
      this.succeedOperation('Сообщение отправлено.');
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async connectedCallback() {
    super.connectedCallback();

    this.bots = null;
    this.apis = null;

    this.beginOperation();

    try {
      await this.checkPresence();

      [this.bots, this.apis] = await Promise.all([
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

      if (!this.apis.length) this.apis = void 0;
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async installationQuery(serviceId, api) {
    const [sendTelegramMessage, installSpbexHalts] = await Promise.all([
      fetch(this.getSQLUrl('send-telegram-message.sql')).then((r) => r.text()),
      fetch(this.getSQLUrl('spbex-halts/install.sql')).then((r) => r.text())
    ]);

    const bot = Object.assign(
      {},
      this.bots.find((b) => b._id === this.bot.value)
    );

    return `${sendTelegramMessage}
      ${await new Tmpl().render(this, installSpbexHalts, {
        serviceId,
        api,
        interval: parseInt(this.interval.value),
        channel: this.channel.value.trim(),
        proxyURL: this.proxyURL.value.trim(),
        instrumentsCode: this.instrumentsCode.value,
        formatterCode: this.formatterCode.value,
        botToken: await this.app.ppp.crypto.decrypt(bot.iv, bot.token)
      })}`;
  }

  async install() {
    this.beginOperation();

    try {
      await validate(this.serviceName);
      await validate(this.api);
      await validate(this.proxyURL);
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
            proxyURL: this.proxyURL.value.trim(),
            botId: this.bot.value,
            interval,
            instrumentsCode: this.instrumentsCode.value,
            formatterCode: this.formatterCode.value,
            channel: +this.channel.value
          }
        );

        serviceId = insertedId;
      }

      const api = Object.assign(
        {},
        this.apis.find((a) => a._id === this.api.value)
      );

      api.password = await this.app.ppp.crypto.decrypt(api.iv, api.password);
      api.key = await this.app.ppp.crypto.decrypt(api.iv, api.key);

      const rInstallationSQL = await this.executeSQL({
        query: await this.installationQuery(serviceId, api),
        api
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
            state: rInstallationSQL.ok
              ? this.service
                ? this.service.state
                : 'stopped'
              : 'failed',
            version: 1,
            updatedAt: new Date(),
            apiId: this.api.value,
            proxyURL: this.proxyURL.value.trim(),
            botId: this.bot.value,
            interval,
            instrumentsCode: this.instrumentsCode.value,
            formatterCode: this.formatterCode.value,
            channel: +this.channel.value
          }
        }
      );

      if (rInstallationSQL.ok) {
        const terminal = this.terminalDom.terminal;

        terminal.writeln('\x1b[32m\r\nppp-sql-ok\r\n\x1b[0m');
        terminal.writeln('');

        this.succeedOperation();
      } else {
        this.failOperation(rInstallationSQL.status);
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.terminalModal.dismissible = true;

      this.endOperation();
    }
  }
}
