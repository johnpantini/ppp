import { Page, PageWithService, PageWithSupabaseService } from './page.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { invalidate, validate } from './validate.js';
import { SERVICE_STATE, SERVICES } from './const.js';
import { Tmpl } from './tmpl.js';
import { uuidv4 } from './ppp-crypto.js';
import ppp from '../ppp.js';

export class ServiceSupabaseParserPage extends Page {
  collection = 'services';

  async callConstsFunction() {
    this.beginOperation();

    try {
      await validate(this.supabaseApiId);
      await validate(this.constsCode);
      await this.callTemporaryFunction({
        api: this.supabaseApiId.datum(),
        functionBody: this.constsCode.value
      });

      this.succeedOperation(
        'База данных выполнила функцию успешно. Смотрите результат в консоли браузера.'
      );
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async callParsingFunction(returnResult) {
    this.beginOperation();

    try {
      await validate(this.supabaseApiId);
      await validate(this.parsingCode);

      this.document.url = this.url.value.trim();
      this.document.frameUrl = this.frameUrl.value.trim();

      const consts = await this.callTemporaryFunction({
        api: this.supabaseApiId.datum(),
        functionBody: this.constsCode.value,
        returnResult: true
      });

      const result = await this.callTemporaryFunction({
        api: this.supabaseApiId.datum(),
        functionBody: `const consts = ${JSON.stringify(consts)};
          ${this.parsingCode.value}
        `,
        returnResult,
        extraSQL: `
          ${await fetch(this.getSQLUrl('ppp-fetch.sql')).then((r) => r.text())}
          ${await fetch(this.getSQLUrl('ppp-xml-parse.sql')).then((r) =>
            r.text()
          )}
        `
      });

      if (!returnResult)
        this.succeedOperation(
          'База данных выполнила функцию успешно. Смотрите результат в консоли браузера.'
        );

      return result;
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async sendTestMessage() {
    this.beginOperation();

    try {
      await validate(this.supabaseApiId);
      await validate(this.botId);
      await validate(this.channel);
      await validate(this.formatterCode);

      const [firstRecord] = await this.callParsingFunction(true);

      if (!firstRecord) {
        console.log(firstRecord);

        invalidate(ppp.app.toast, {
          errorMessage:
            'Функция парсинга вернула результат, который не пригоден для форматирования.',
          raiseException: true
        });
      }

      // Once again
      this.beginOperation();

      const temporaryFormatterName = `ppp_${uuidv4().replaceAll('-', '_')}`;

      // Returns form data
      const temporaryFormatterBody = `function ${temporaryFormatterName}(record) {
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

      const consts = await this.callTemporaryFunction({
        api: this.supabaseApiId.datum(),
        functionBody: this.constsCode.value,
        returnResult: true
      });

      const functionBody = `${temporaryFormatterBody}
        const record = ${JSON.stringify(firstRecord)};
        const consts = ${JSON.stringify(consts)};

        plv8.execute(\`select content from http_post('https://api.telegram.org/bot${
          this.botId.datum().token
        }/sendMessage',
        '\${${temporaryFormatterName}(record)}',
        'application/x-www-form-urlencoded')\`);`;

      await this.callTemporaryFunction({
        api: this.supabaseApiId.datum(),
        functionBody
      });

      this.succeedOperation('Сообщение отправлено.');
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async #deploy() {
    if (!this.document.supabaseApi)
      this.document.supabaseApi = this.supabaseApiId.datum();

    if (!this.document.pusherApi)
      this.document.pusherApi = this.pusherApiId.datum();

    if (!this.document.bot) this.document.bot = this.botId.datum();

    const [sendTelegramMessage, pppXmlParse, pppFetch, deployParser] =
      await Promise.all([
        fetch(this.getSQLUrl('send-telegram-message.sql')).then((r) =>
          r.text()
        ),
        fetch(this.getSQLUrl('ppp-xml-parse.sql')).then((r) => r.text()),
        fetch(this.getSQLUrl('ppp-fetch.sql')).then((r) => r.text()),
        fetch(this.getSQLUrl(`${SERVICES.SUPABASE_PARSER}/deploy.sql`)).then(
          (r) => r.text()
        )
      ]);

    this.document.consts = JSON.stringify(
      await this.callTemporaryFunction({
        api: this.supabaseApiId.datum(),
        functionBody: this.constsCode.value,
        returnResult: true
      })
    );

    const query = `${sendTelegramMessage}
      ${pppXmlParse}
      ${pppFetch}
      ${await new Tmpl().render(this, deployParser, {})}`;

    await this.executeSQL({
      api: this.document.supabaseApi,
      query: await new Tmpl().render(this, query, {})
    });
  }

  async validate() {
    await validate(this.name);
    await validate(this.supabaseApiId);
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

    await validate(this.tableSchema);
    await validate(this.constsCode);
    await validate(this.parsingCode);
    await validate(this.insertTriggerCode);
    await validate(this.deleteTriggerCode);

    if (this.telegramEnabled.checked) {
      await validate(this.botId);
      await validate(this.channel);
      await validate(this.formatterCode);
    } else {
      this.botId.state = 'default';
      this.channel.state = 'default';
      this.formatterCode.state = 'default';
    }
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
              type: `[%#(await import('./const.js')).SERVICES.SUPABASE_PARSER%]`
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
              from: 'apis',
              localField: 'pusherApiId',
              foreignField: '_id',
              as: 'pusherApi'
            }
          },
          {
            $unwind: {
              path: '$pusherApi',
              preserveNullAndEmptyArrays: true
            }
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
            $unwind: {
              path: '$bot',
              preserveNullAndEmptyArrays: true
            }
          }
        ]);
    };
  }

  async find() {
    return {
      type: SERVICES.SUPABASE_PARSER,
      name: this.name.value.trim(),
      removed: { $ne: true }
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
          url: this.url.value.trim(),
          frameUrl: this.frameUrl.value.trim(),
          pusherApiId: this.pusherApiId.value,
          interval: Math.ceil(Math.abs(this.interval.value)),
          depth: Math.ceil(Math.abs(this.depth.value)),
          tableSchema: this.tableSchema.value,
          constsCode: this.constsCode.value,
          parsingCode: this.parsingCode.value,
          insertTriggerCode: this.insertTriggerCode.value,
          deleteTriggerCode: this.deleteTriggerCode.value,
          telegramEnabled: this.telegramEnabled.checked,
          botId: this.botId.value,
          channel: +this.channel.value,
          formatterCode: this.formatterCode.value,
          version: 1,
          state: SERVICE_STATE.FAILED,
          updatedAt: new Date()
        },
        $setOnInsert: {
          type: SERVICES.SUPABASE_PARSER,
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

applyMixins(
  ServiceSupabaseParserPage,
  PageWithService,
  PageWithSupabaseService
);
