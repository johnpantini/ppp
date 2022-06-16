/** @decorator */

import { validate, ValidationError } from '../validate.js';
import { maybeFetchError } from '../fetch-error.js';
import { uuidv4 } from '../ppp-crypto.js';
import { SUPPORTED_APIS, SUPPORTED_SERVICES } from '../const.js';
import { Observable, observable } from '../element/observation/observable.js';
import { Tmpl } from '../tmpl.js';
import { SupabaseParserPage } from '../supabase-parser-page.js';

export class ServiceSupabaseParserPage extends SupabaseParserPage {
  @observable
  bots;

  @observable
  apis;

  @observable
  telegramEnabled;

  type = SUPPORTED_SERVICES.SUPABASE_PARSER;

  async callConstsFunction(returnResult = false) {
    this.beginOperation();

    try {
      await validate(this.api);
      await validate(this.constsCode);

      const funcName = `pg_temp.ppp_${uuidv4().replaceAll('-', '_')}`;
      const api = this.apis.find((a) => a._id === this.api.value);
      const password = await this.app.ppp.crypto.decrypt(api.iv, api.password);
      // Temporary function, no need to drop
      const query = `create or replace function ${funcName}()
        returns json as
        $$
          ${await new Tmpl().render(this, this.constsCode.value, {
            api,
            url: this.url.value.trim(),
            frameUrl: this.frameUrl.value.trim()
          })}
        $$ language plv8;

        select ${funcName}();
        `;

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

      const result = JSON.parse(
        (await rTestSQL.json()).results.find(
          (r) => r.command.toUpperCase() === 'SELECT'
        ).rows[0][0]
      );

      if (returnResult) {
        return result;
      } else console.log(result);

      this.succeedOperation(
        'База данных выполнила функцию успешно. Смотрите результат в консоли браузера.'
      );
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async callParsingFunction(returnResult = false) {
    this.beginOperation();

    try {
      await validate(this.api);
      await validate(this.parsingCode);

      const funcName = `pg_temp.ppp_${uuidv4().replaceAll('-', '_')}`;
      const api = this.apis.find((a) => a._id === this.api.value);
      const password = await this.app.ppp.crypto.decrypt(api.iv, api.password);
      // Temporary function, no need to drop
      const query = `
        ${await fetch(this.getSQLUrl('ppp-fetch.sql')).then((r) => r.text())}
        ${await fetch(this.getSQLUrl('ppp-xml-parse.sql')).then((r) =>
          r.text()
        )}

        create or replace function ${funcName}()
        returns json as
        $$
          const consts = ${JSON.stringify(await this.callConstsFunction(true))};

          ${await new Tmpl().render(this, this.parsingCode.value, {
            api,
            url: this.url.value.trim(),
            frameUrl: this.frameUrl.value.trim()
          })}
        $$ language plv8;

        select ${funcName}();
        `;

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

      const result = JSON.parse(
        (await rTestSQL.json()).results.find(
          (r) => r.command.toUpperCase() === 'SELECT'
        ).rows[0][0]
      );

      if (returnResult) {
        return result;
      } else console.log(result);

      this.succeedOperation(
        'База данных выполнила функцию успешно. Смотрите результат в консоли браузера.'
      );
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async sendTestMessage() {
    this.beginOperation();

    try {
      await validate(this.api);
      await validate(this.bot);
      await validate(this.channel);
      await validate(this.formatterCode);

      const [firstRecord] = await this.callParsingFunction(true);

      if (!firstRecord) {
        // noinspection ExceptionCaughtLocallyJS
        throw new ValidationError({
          element: this.app.toast,
          status: 404,
          message:
            'Функция парсинга вернула результат, который не пригоден для форматирования.'
        });
      }

      const funcName = `ppp_${uuidv4().replaceAll('-', '_')}`;

      // Returns form data
      const temporaryFunction = `function ${funcName}(record) {
          const closure = () => {${this.formatterCode.value}};
          const formatted = closure();

          if (typeof formatted === 'string')
            return \`chat_id=${this.channel.value}&text=\${formatted.replace(/'/g, '%27')}&parse_mode=html\`;
          else {
            const options = formatted.options || {};
            let formData = \`chat_id=${this.channel.value}&text=\${formatted.text.replace(/'/g, '%27')}\`;

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

         const record = ${JSON.stringify(firstRecord)};

         plv8.execute(\`select content from http_post('https://api.telegram.org/bot${
           bot.token
         }/sendMessage',
        '\${${funcName}(record)}',
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

      this.telegramEnabled = this.service?.telegramEnabled;

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
    const [sendTelegramMessage, pppXmlParse, pppFetch, installParser] =
      await Promise.all([
        fetch(this.getSQLUrl('send-telegram-message.sql')).then((r) =>
          r.text()
        ),
        fetch(this.getSQLUrl('ppp-xml-parse.sql')).then((r) => r.text()),
        fetch(this.getSQLUrl('ppp-fetch.sql')).then((r) => r.text()),
        fetch(this.getSQLUrl('supabase-parser/install.sql')).then((r) =>
          r.text()
        )
      ]);

    const bot = Object.assign(
      {},
      this.bots.find((b) => b._id === this.bot.value)
    );

    let interval = parseInt(this.interval.value);

    if (interval < 1 || isNaN(interval)) interval = 5;

    let depth = parseInt(this.depth.value);

    if (depth < 1 || isNaN(depth)) depth = 50;

    return `${sendTelegramMessage}
      ${pppXmlParse}
      ${pppFetch}
      ${await new Tmpl().render(this, installParser, {
        serviceId,
        api,
        userAgent: navigator.userAgent,
        interval,
        depth,
        tableSchema: this.tableSchema.value,
        constsCode: await new Tmpl().render(this, this.constsCode.value, {
          api,
          url: this.url.value.trim(),
          frameUrl: this.frameUrl.value.trim()
        }),
        parsingCode: await new Tmpl().render(this, this.parsingCode.value, {
          api,
          url: this.url.value.trim(),
          frameUrl: this.frameUrl.value.trim()
        }),
        insertTriggerCode: await new Tmpl().render(
          this,
          this.insertTriggerCode.value,
          {
            api,
            url: this.url.value.trim(),
            frameUrl: this.frameUrl.value.trim()
          }
        ),
        deleteTriggerCode: await new Tmpl().render(
          this,
          this.deleteTriggerCode.value,
          {
            api,
            url: this.url.value.trim(),
            frameUrl: this.frameUrl.value.trim()
          }
        ),
        formatterCode: await new Tmpl().render(this, this.formatterCode.value, {
          api,
          url: this.url.value.trim(),
          frameUrl: this.frameUrl.value.trim()
        }),
        channel: this.channel.value.trim(),
        telegramEnabled: this.telegramEnabledFlag.checked,
        botToken: bot
          ? await this.app.ppp.crypto.decrypt(bot.iv, bot.token)
          : void 0
      })}`;
  }

  async install() {
    this.beginOperation();

    try {
      await validate(this.serviceName);
      await validate(this.api);
      await validate(this.interval);
      await validate(this.depth);
      await validate(this.tableSchema);
      await validate(this.constsCode);
      await validate(this.parsingCode);
      await validate(this.insertTriggerCode);
      await validate(this.deleteTriggerCode);

      if (this.telegramEnabledFlag.checked) {
        await validate(this.bot);
        await validate(this.channel);
        await validate(this.formatterCode);
      } else {
        this.bot.state = 'default';
        this.channel.state = 'default';
        this.formatterCode.state = 'default';
      }

      let interval = parseInt(this.interval.value);

      if (interval < 1 || isNaN(interval)) interval = 5;

      let depth = parseInt(this.depth.value);

      if (depth < 1 || isNaN(depth)) depth = 50;

      let serviceId = this.service?._id;

      if (!this.service) {
        const existingService = await this.app.ppp.user.functions.findOne(
          {
            collection: 'services'
          },
          {
            removed: { $not: { $eq: true } },
            type: SUPPORTED_SERVICES.SUPABASE_PARSER,
            name: this.serviceName.value.trim()
          },
          {
            _id: 1
          }
        );

        if (existingService) {
          return this.failOperation({
            href: `?page=service-${SUPPORTED_SERVICES.SUPABASE_PARSER}&service=${existingService._id}`,
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
            type: SUPPORTED_SERVICES.SUPABASE_PARSER,
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            apiId: this.api.value,
            url: this.url.value.trim(),
            frameUrl: this.frameUrl.value.trim(),
            interval,
            depth,
            telegramEnabled: this.telegramEnabledFlag.checked,
            tableSchema: this.tableSchema.value,
            constsCode: this.constsCode.value,
            parsingCode: this.parsingCode.value,
            insertTriggerCode: this.insertTriggerCode.value,
            deleteTriggerCode: this.deleteTriggerCode.value,
            botId: this.bot.value,
            channel: +this.channel.value || '',
            formatterCode: this.formatterCode.value
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

      const state = rInstallationSQL.ok
        ? this.service
          ? this.service.state === 'failed'
            ? 'stopped'
            : this.service.state
          : 'stopped'
        : 'failed';

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
            state,
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            apiId: this.api.value,
            url: this.url.value.trim(),
            frameUrl: this.frameUrl.value.trim(),
            interval,
            depth,
            telegramEnabled: this.telegramEnabledFlag.checked,
            tableSchema: this.tableSchema.value,
            constsCode: this.constsCode.value,
            parsingCode: this.parsingCode.value,
            insertTriggerCode: this.insertTriggerCode.value,
            deleteTriggerCode: this.deleteTriggerCode.value,
            botId: this.bot.value,
            channel: +this.channel.value || '',
            formatterCode: this.formatterCode.value
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
