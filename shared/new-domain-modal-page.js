/** @decorator */

import { Page } from './page.js';
import { validate } from './validate.js';
import { Observable, observable } from './element/observation/observable.js';
import ppp from '../ppp.js';

export class NewDomainModalPage extends Page {
  collection = 'servers';

  /**
   * The parent page (<ppp-server-page>).
   */
  @observable
  parent;

  getDocumentId() {
    return false;
  }

  async save() {
    this.beginOperation();

    try {
      await validate(this.certbotEmail);
      await validate(this.certbotDomains);

      const domains = this.certbotDomains.value
        .trim()
        .split(',')
        .map((d) => d.trim());

      const commands = [
        'sudo salt-call --local state.sls epel ;',
        'sudo firewall-cmd --permanent --add-service=http ;',
        'sudo firewall-cmd --reload ;',
        'sudo pip install --force-reinstall --target /usr/lib/python3.9/site-packages cryptography==37.0.2 pyopenssl==22.0.0 ;',
        'sudo pip install --force-reinstall --target /usr/lib64/python3.9/site-packages cryptography==37.0.2 pyopenssl==22.0.0 ;',
        'sudo dnf -y install python3-cryptography python3-pyOpenSSL python-cffi python-pycparser certbot ;',
        domains
          .map(
            (d) =>
              `sudo certbot certonly --standalone --non-interactive --agree-tos -m ${this.certbotEmail.value} -d ${d} `
          )
          .join('&& ') + ' &&',
        'sudo systemctl enable certbot-renew.timer &&',
        'sudo systemctl restart certbot-renew.timer && '
      ].join(' ');

      if (
        !(await this.parent.executeSSHCommands({
          server: this.parent.document,
          commands,
          commandsToDisplay: commands
        }))
      ) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error('Не удалось добавить домены.');
      }

      await ppp.user.functions.updateOne(
        {
          collection: 'servers'
        },
        {
          _id: this.parent.document._id
        },
        {
          $addToSet: {
            domains: {
              $each: domains
            }
          }
        }
      );

      if (typeof this.parent.document.domains === 'undefined')
        this.parent.document.domains = [];

      domains.forEach((d) => {
        if (this.parent.document.domains.indexOf(d) === -1)
          this.parent.document.domains.push(d);
      });

      Observable.notify(this.parent, 'document');
      this.succeedOperation();
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  connectedCallback() {
    super.connectedCallback();

    this.closest('ppp-modal').visibleChanged = (oldValue, newValue) =>
      !newValue && (ppp.app.toast.visible = false);
  }
}
