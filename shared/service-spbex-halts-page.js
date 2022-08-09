import { Page, PageWithService, PageWithSupabaseService } from './page.js';
import { invalidate, validate } from './validate.js';
import { Tmpl } from './tmpl.js';
import { SERVICE_STATE, SERVICES } from './const.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { uuidv4 } from './ppp-crypto.js';
import ppp from '../ppp.js';

export class ServiceSpbexHaltsPage extends Page {
  collection = 'services';

  async callInstrumentsFunction() {
    this.beginOperation();

    try {
      await validate(this.supabaseApiId);
      await validate(this.instrumentsCode);
      await this.callTemporaryFunction(
        this.supabaseApiId.datum(),
        this.instrumentsCode.value
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
      await validate(this.supabaseApiId);
      await validate(this.botId);
      await validate(this.channel);
      await validate(this.formatterCode);

      const funcName = `ppp_${uuidv4().replaceAll('-', '_')}`;

      // Returns form data
      const temporaryFunction = `function ${funcName}(isin,
        ticker, name, currency, date, url, start, finish) {
          const closure = () => {${this.formatterCode.value}};
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

      const query = `${temporaryFunction}
         return plv8.execute(\`select content from http_post('https://api.telegram.org/bot${
           this.botId.datum().token
         }/sendMessage',
        '\${${funcName}('US0400476075', 'ARNA', 'Arena Pharmaceuticals, Inc.', 'USD', '13.12.2021 14:42',
        'https://spbexchange.ru/ru/about/news.aspx?section=17&news=27044', '14:45', '15:15')}',
        'application/x-www-form-urlencoded')\`);`;

      await this.callTemporaryFunction(this.supabaseApiId.datum(), query);

      this.succeedOperation('Сообщение отправлено.');
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async proxyHeadersToJSONString() {
    const proxyHeaders = await new Tmpl().render(
      this,
      this.document.proxyHeaders,
      {}
    );

    const AsyncFunction = Object.getPrototypeOf(
      async function () {}
    ).constructor;

    return JSON.stringify(await new AsyncFunction(`return ${proxyHeaders}`)());
  }

  async #deploy() {
    if (!this.document.supabaseApi)
      this.document.supabaseApi = this.supabaseApiId.datum();

    if (!this.document.bot) this.document.bot = this.botId.datum();

    const [sendTelegramMessage, deploySpbexHalts] = await Promise.all([
      fetch(this.getSQLUrl('send-telegram-message.sql')).then((r) => r.text()),
      fetch(this.getSQLUrl(`${SERVICES.SPBEX_HALTS}/deploy.sql`)).then((r) =>
        r.text()
      )
    ]);

    const query = `${sendTelegramMessage}
      ${await new Tmpl().render(this, deploySpbexHalts, {})}`;

    await this.executeSQL({
      api: this.document.supabaseApi,
      query: await new Tmpl().render(this, query, {})
    });
  }

  async validate() {
    await validate(this.name);
    await validate(this.supabaseApiId);
    await validate(this.proxyURL);

    try {
      new URL(this.proxyURL.value);
    } catch (e) {
      invalidate(this.proxyURL, {
        errorMessage: 'Неверный или неполный URL',
        raiseException: true
      });
    }

    await validate(this.proxyHeaders);
    await validate(this.interval);
    await validate(this.interval, {
      hook: async (value) => +value > 0 && +value <= 1000,
      errorMessage: 'Введите значение в диапазоне от 1 до 1000'
    });
    await validate(this.depth);
    await validate(this.depth, {
      hook: async (value) => +value >= 30 && +value <= 10000,
      errorMessage: 'Введите значение в диапазоне от 30 до 10000'
    });
    await validate(this.instrumentsCode);
    await validate(this.botId);
    await validate(this.channel);
    await validate(this.formatterCode);
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.page.view.collection%]')
        .aggregate([
          {
            $match: {
              _id: new BSON.ObjectId('[%#payload.documentId%]'),
              type: `[%#(await import('./const.js')).SERVICES.SPBEX_HALTS%]`
            }
          },
          {
            $lookup: {
              from: 'apis',
              localField: 'supabaseApiId',
              foreignField: '_id',
              as: 'supabaseApi'
            }
          },
          {
            $unwind: '$supabaseApi'
          },
          {
            $lookup: {
              from: 'bots',
              localField: 'botId',
              foreignField: '_id',
              as: 'bot'
            }
          },
          {
            $unwind: '$bot'
          }
        ]);
    };
  }

  async find() {
    return {
      type: SERVICES.SPBEX_HALTS,
      name: this.name.value.trim()
    };
  }

  async update() {
    const state =
      this.document.state === SERVICE_STATE.ACTIVE
        ? SERVICE_STATE.ACTIVE
        : SERVICE_STATE.STOPPED;

    return [
      {
        $set: {
          name: this.name.value.trim(),
          supabaseApiId: this.supabaseApiId.value,
          proxyURL: this.proxyURL.value.trim(),
          proxyHeaders: this.proxyHeaders.value,
          interval: Math.ceil(Math.abs(this.interval.value)),
          depth: Math.ceil(Math.abs(this.depth.value)),
          instrumentsCode: this.instrumentsCode.value,
          botId: this.botId.value,
          channel: +this.channel.value,
          formatterCode: this.formatterCode.value,
          version: 1,
          state: SERVICE_STATE.FAILED,
          updatedAt: new Date()
        },
        $setOnInsert: {
          type: SERVICES.SPBEX_HALTS,
          createdAt: new Date()
        }
      },
      this.#deploy,
      () => ({
        $set: {
          state,
          updatedAt: new Date()
        }
      })
    ];
  }
}

applyMixins(ServiceSpbexHaltsPage, PageWithService, PageWithSupabaseService);
