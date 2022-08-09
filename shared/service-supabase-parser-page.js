import { Page, PageWithService, PageWithSupabaseService } from './page.js';
import { applyMixins } from './utilities/apply-mixins.js';
import { validate } from './validate.js';
import { SERVICE_STATE, SERVICES } from './const.js';
import { Tmpl } from './tmpl.js';

export class ServiceSupabaseParserPage extends Page {
  collection = 'services';

  async callConstsFunction(returnResult) {
    this.beginOperation();

    try {
      await validate(this.supabaseApiId);
      await validate(this.constsCode);
      await this.callTemporaryFunction(
        this.supabaseApiId.datum(),
        this.constsCode.value,
        returnResult
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

  async callParsingFunction() {
    this.beginOperation();

    try {
      await validate(this.supabaseApiId);
      await validate(this.parsingCode);

      const consts = await this.callTemporaryFunction(
        this.supabaseApiId.datum(),
        this.constsCode.value,
        true
      );

      await this.callTemporaryFunction(
        this.supabaseApiId.datum(),
        `const consts = ${JSON.stringify(consts)};

        ${this.parsingCode.value}
        `
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

  async #deploy() {
    if (!this.document.supabaseApi)
      this.document.supabaseApi = this.supabaseApiId.datum();

    if (!this.document.bot) this.document.bot = this.botId.datum();

    const [sendTelegramMessage, deploySpbexHalts] = await Promise.all([
      fetch(this.getSQLUrl('send-telegram-message.sql')).then((r) => r.text()),
      fetch(this.getSQLUrl(`${SERVICES.SUPABASE_PARSER}/deploy.sql`)).then(
        (r) => r.text()
      )
    ]);

    const query = `${sendTelegramMessage}
      ${await new Tmpl().render(this, deploySpbexHalts, {})}`;

    await this.executeSQL({
      api: this.document.supabaseApi,
      query
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
      type: SERVICES.SUPABASE_PARSER,
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
          url: this.url.value.trim(),
          frameUrl: this.frameUrl.value.trim(),
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
