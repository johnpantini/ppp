import { html, css, ref } from '../../vendor/fast-element.min.js';
import { validate } from '../../lib/ppp-errors.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import { APIS } from '../../lib/const.js';
import {
  upsertMongoDBRealmScheduledTrigger,
  removeMongoDBRealmTrigger
} from '../../lib/realm.js';
import '../badge.js';
import '../banner.js';
import '../button.js';
import '../checkbox.js';
import '../query-select.js';
import '../text-field.js';

export const apiRedisPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
      <section>
        <div class="label-group">
          <h5>Название подключения</h5>
          <p class="description">
            Произвольное имя, чтобы ссылаться на этот профиль, когда
            потребуется.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="Redis"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Хост</h5>
          <p class="description">Хост для подключения.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="Введите адрес"
            value="${(x) => x.document.host}"
            ${ref('host')}
          ></ppp-text-field>
          <div class="spacing2"></div>
          <ppp-checkbox
            ?checked="${(x) => x.document.tls ?? true}"
            ${ref('tls')}
          >
            Защищённое соединение
          </ppp-checkbox>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Порт</h5>
          <p class="description">Порт для подключения.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="number"
            placeholder="6379"
            value="${(x) => x.document.port ?? 6379}"
            ${ref('port')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>База данных</h5>
          <p class="description">Индекс базы данных Redis для подключения.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="number"
            placeholder="0"
            value="${(x) => x.document.database ?? 0}"
            ${ref('database')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Имя пользователя</h5>
          <p class="description">Имя пользователя для подключения.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            optional
            placeholder="Имя пользователя"
            value="${(x) => x.document.username}"
            ${ref('username')}
          ></${'ppp-text-field'}>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Пароль</h5>
          <p class="description">Пароль Redis.</p>
        </div>
        <div class="input-group">
          <ppp-text-field
            optional
            type="password"
            placeholder="Пароль"
            value="${(x) => x.document.password}"
            ${ref('password')}
          ></ppp-text-field>
        </div>
      </section>    
      ${documentPageFooterPartial({})}
    </form>
  </template>
`;

export const apiRedisPageStyles = css`
  ${pageStyles}
  ppp-banner {
    margin-right: auto;
  }
`;

export class ApiRedisPage extends Page {
  collection = 'apis';

  async validate() {
    await validate(this.name);
    await validate(this.host);
    await validate(this.port);
    await validate(this.database);

    if (this.host.value.endsWith('upstash.io')) {
      await validate(this.database, {
        hook: async (value) => +value === 0,
        errorMessage:
          'Upstash поддерживает только базу данных с нулевым индексом'
      });
    }

    await validate(this.database, {
      hook: async (value) => +value >= 0 && +value <= 16,
      errorMessage: 'Введите значение в диапазоне от 0 до 16'
    });
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
              type: `[%#(await import(ppp.rootUrl + '/lib/const.js')).APIS.REDIS%]`
            }
          }
        ]);
    };
  }

  async find() {
    return {
      type: APIS.REDIS,
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async #createUpstashRedisPingTrigger() {
    if (this.document.host.endsWith('upstash.io')) {
      // Upstash specific code and options.
      return upsertMongoDBRealmScheduledTrigger({
        functionName: `pppUpstashRedisPing${this.document._id}`,
        triggerName: `pppUpstashRedisPingTrigger${this.document._id}`,
        schedule: '0 */12 * * *',
        functionSource: `
        exports = function () {
          const tls = require('tls');
 
          const star = Buffer.from('*', 'ascii');
          const dollar = Buffer.from('$', 'ascii');
          const crlf = Buffer.from('\\r\\n', 'ascii');
          
          function toRESPBulkString(string) {
            const asciiString = Buffer.from(string, 'ascii');
            const byteLength = Buffer.from(String(asciiString.length), 'ascii');
            const totalLength =
              dollar.length +
              byteLength.length +
              crlf.length +
              asciiString.length +
              crlf.length;
          
            return Buffer.concat(
              [dollar, byteLength, crlf, asciiString, crlf],
              totalLength
            );
          }
          
          function toRESPArray(command) {
            const respStrings = command.map(toRESPBulkString);
            const stringCount = Buffer.from(String(respStrings.length), 'ascii');
          
            return Buffer.concat([star, stringCount, crlf, ...respStrings]);
          }
          
          function createRedisCommand(commands) {
            const respArrays = commands.map(toRESPArray);
          
            return Buffer.concat([...respArrays, crlf]);
          }
          
          const socket = tls.connect({
            host: '${this.host.value.trim()}',
            port: ${Math.abs(+this.port.value)},
            servername: '${this.host.value.trim()}'
          });
          
          socket.setEncoding('utf8');
          socket.on('connect', () => {
            socket.write(
              createRedisCommand([
                ['auth', '${this.username.value.trim()}' || 'default', '${this.password.value.trim()}']
              ])
            );
            socket.write(
              createRedisCommand([['set', 'ppp:${
                this.document._id
              }', new Date().toISOString()]])
            );
          
            process.nextTick(() => socket.end());
          });
        };
      `
      });
    }
  }

  async submit() {
    return [
      {
        $set: {
          name: this.name.value.trim(),
          host: this.host.value.trim(),
          port: Math.abs(this.port.value.trim()),
          tls: this.tls.checked,
          database: Math.abs(+this.database.value),
          username: this.username.value.trim(),
          password: this.password.value.trim(),
          version: 1,
          updatedAt: new Date()
        },
        $setOnInsert: {
          type: APIS.REDIS,
          createdAt: new Date()
        }
      },
      this.#createUpstashRedisPingTrigger,
      () => ({
        $set: {
          updatedAt: new Date()
        }
      })
    ];
  }

  async cleanup() {
    if (this.document.host.endsWith('upstash.io')) {
      return removeMongoDBRealmTrigger({
        triggerName: `pppUpstashRedisPingTrigger${this.document._id}`
      });
    }
  }
}

export default ApiRedisPage.compose({
  template: apiRedisPageTemplate,
  styles: apiRedisPageStyles
}).define();
