import { Tmpl } from './tmpl.js';
import { Observable } from './element/observation/observable.js';
import { maybeFetchError } from './fetch-error.js';
import { ServiceWithSupabasePage } from './page.js';

export class SupabaseParserPage extends ServiceWithSupabasePage {
  async performAction({
    file,
    title,
    $set,
    after = async () => Promise.resolve()
  }) {
    this.beginOperation(title);

    try {
      const api = Object.assign(
        {},
        this.apis.find((a) => a._id === this.api.value)
      );

      api.password = await this.app.ppp.crypto.decrypt(api.iv, api.password);
      api.key = await this.app.ppp.crypto.decrypt(api.iv, api.key);

      api.hostname = 'db.' + new URL(api.url).hostname;

      const rActionSQL = await this.executeSQL({
        query: await new Tmpl().render(
          this,
          await fetch(this.getSQLUrl(file)).then((r) => r.text()),
          {
            serviceId: this.service._id,
            api,
            interval: parseInt(this.interval.value)
          }
        ),
        api
      });

      await this.app.ppp.user.functions.updateOne(
        {
          collection: 'services'
        },
        {
          _id: this.service._id
        },
        {
          $set
        }
      );

      if (rActionSQL.ok) {
        Object.assign(this.service, $set);
        Observable.notify(this, 'service');
        await after(api, this.service._id);

        const terminal = this.terminalDom.terminal;

        terminal.writeln('\x1b[32m\r\nppp-sql-ok\r\n\x1b[0m');
        terminal.writeln('');

        this.succeedOperation();
      } else {
        this.failOperation(rActionSQL.status);
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.terminalModal.dismissible = true;

      this.endOperation();
    }
  }

  async stop() {
    return this.performAction({
      file: `${this.type}/stop.sql`,
      title: 'Остановка сервиса',
      $set: {
        state: 'stopped',
        updatedAt: new Date()
      }
    });
  }

  async restart() {
    await this.performAction({
      file: `${this.type}/start.sql`,
      title: 'Запуск сервиса',
      $set: {
        state: 'active',
        updatedAt: new Date()
      },
      after: async (api, serviceId) => {
        await maybeFetchError(
          await fetch(
            new URL(
              'fetch',
              this.app.ppp.keyVault.getKey('service-machine-url')
            ).toString(),
            {
              cache: 'no-cache',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                method: 'POST',
                url: new URL(
                  `/rest/v1/rpc/loop_${serviceId}`,
                  api.url
                ).toString(),
                headers: {
                  apikey: api.key,
                  'Content-Type': 'application/json'
                }
              })
            }
          )
        );
      }
    });
  }

  async remove() {
    return this.performAction({
      file: `${this.type}/remove.sql`,
      title: 'Удаление сервиса',
      $set: {
        state: 'stopped',
        removed: true,
        updatedAt: new Date()
      }
    });
  }
}
