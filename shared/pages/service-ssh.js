/** @decorator */

import { PageWithTerminal } from '../page.js';
import { validate } from '../validate.js';
import { SUPPORTED_SERVICES } from '../const.js';
import { Observable, observable } from '../element/observation/observable.js';
import { Tmpl } from '../tmpl.js';
import { generateIV, bufferToString } from '../ppp-crypto.js';

export class ServiceSshPage extends PageWithTerminal {
  @observable
  service;

  @observable
  servers;

  @observable
  secrets;

  @observable
  domSecrets;

  async addSecret() {
    const value = '';

    if (!this.secrets) this.secrets = [value];
    else this.secrets.push(value);
  }

  async connectedCallback() {
    super.connectedCallback();

    const serviceId = this.app.params()?.service;

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
            type: SUPPORTED_SERVICES.SSH
          }
        );

        if (!this.service) {
          this.failOperation(404);

          return await this.notFound();
        } else {
          this.secrets = [];

          for (const s of this.service.secrets) {
            this.secrets.push(
              await this.app.ppp.crypto.decrypt(this.service.iv, s)
            );
          }

          Observable.notify(this, 'service');
        }
      }

      [this.servers] = await Promise.all([
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
        )
      ]);

      if (!this.servers.length) this.servers = void 0;
    } catch (e) {
      this.failOperation(e);
      await this.notFound();
    } finally {
      this.endOperation();
    }
  }

  async install() {
    this.beginOperation();

    try {
      await validate(this.serviceName);
      await validate(this.server);

      const iv = generateIV();
      const encryptedSecrets = [];

      for (const domSecret of this.domSecrets) {
        await validate(domSecret);

        encryptedSecrets.push(
          await this.app.ppp.crypto.encrypt(iv, domSecret.value.trim())
        );
      }

      await validate(this.installCode);

      let serviceId = this.service?._id;

      if (!this.service) {
        const existingService = await this.app.ppp.user.functions.findOne(
          {
            collection: 'services'
          },
          {
            removed: { $not: { $eq: true } },
            type: SUPPORTED_SERVICES.SSH,
            name: this.serviceName.value.trim()
          },
          {
            _id: 1
          }
        );

        if (existingService) {
          return this.failOperation({
            href: `?page=service-${SUPPORTED_SERVICES.SSH}&service=${existingService._id}`,
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
            type: SUPPORTED_SERVICES.SSH,
            version: 1,
            iv: bufferToString(iv),
            secrets: encryptedSecrets,
            createdAt: new Date(),
            updatedAt: new Date(),
            serverId: this.server.value,
            installCode: this.installCode.value,
            removeCode: this.removeCode.value
          }
        );

        serviceId = insertedId;
      }

      const ok = await this.executeSSHCommand({
        serverId: this.server.value,
        commands:
          (await new Tmpl().render(this, this.installCode.value.trim(), {})) +
          ' && '
      });

      if (ok) {
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
              iv: bufferToString(iv),
              secrets: encryptedSecrets,
              updatedAt: new Date(),
              serverId: this.server.value,
              installCode: this.installCode.value,
              removeCode: this.removeCode.value
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
      let removeCode = await new Tmpl().render(
        this,
        this.service.removeCode.trim(),
        {}
      );

      if (removeCode) removeCode += ' && ';

      const ok = await this.executeSSHCommand({
        serverId: this.service.serverId,
        commands: removeCode
      });

      if (ok) {
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
              updatedAt: new Date()
            }
          }
        );

        this.service.removed = true;
        this.service.state = 'stopped';
        Observable.notify(this, 'service');
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
