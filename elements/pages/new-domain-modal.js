/** @decorator */

import ppp from '../../ppp.js';
import {
  html,
  css,
  Observable,
  ref,
  observable
} from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { invalidate, validate } from '../../lib/ppp-errors.js';
import { getAspirantWorkerBaseUrl } from './service-ppp-aspirant-worker.js';
import '../button.js';
import '../text-field.js';

export const newDomainModalPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <section>
        <div class="label-group full">
          <h5>Email</h5>
          <p class="description">
            Адрес регистрации учётной записи
            <a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://letsencrypt.org/"
            >
              Let's Encrypt
            </a>
            для получения служебных уведомлений (например, при скором истечении
            сертификата).
          </p>
          <ppp-text-field
            placeholder="Email"
            ${ref('certbotEmail')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group full">
          <h5>Домены</h5>
          <p class="description">
            Список доменов, для которых нужно получить сертификаты. Можно ввести
            несколько через запятую.
          </p>
          <ppp-text-field
            placeholder="example.com, www.example.com"
            ${ref('certbotDomains')}
          ></ppp-text-field>
        </div>
      </section>
      <footer>
        <ppp-button
          type="submit"
          appearance="primary"
          @click="${(x) => x.submitDocument()}"
        >
          Добавить домены
        </ppp-button>
      </footer>
    </form>
  </template>
`;

export const newDomainModalPageStyles = css`
  ${pageStyles}
  section:first-of-type {
    padding-top: 10px;
  }

  .label-group ppp-select,
  .label-group ppp-text-field {
    max-width: unset;
  }
`;

export class NewDomainModalPage extends Page {
  /**
   * The parent page (<ppp-server-page>).
   */
  @observable
  parent;

  async submitDocument() {
    this.beginOperation();

    try {
      await validate(this.certbotEmail);
      await validate(this.certbotDomains);

      const domains = this.certbotDomains.value
        .trim()
        .split(',')
        .map((d) => d.trim());

      const commands = [
        'sudo firewall-cmd --permanent --add-service=http ;',
        'sudo firewall-cmd --reload ;',
        'sudo dnf -y install python3-pip ;',
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

      const connector = this.parent.connectorServiceId.datum();
      const connectorUrl = await getAspirantWorkerBaseUrl(connector);

      if (
        !(await this.parent.executeSSHCommands({
          server: this.parent.document,
          connectorUrl,
          commands,
          commandsToDisplay: commands
        }))
      ) {
        // noinspection ExceptionCaughtLocallyJS
        invalidate(this.host, {
          errorMessage: 'Не удалось добавить домены.',
          raiseException: true
        });
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
      this.showSuccessNotification();
    } catch (e) {
      this.failOperation(e, 'Добавление доменов');
    } finally {
      this.endOperation();
    }
  }
}

export default NewDomainModalPage.compose({
  template: newDomainModalPageTemplate,
  styles: newDomainModalPageStyles
}).define();
