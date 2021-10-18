/** @decorator */

import { BasePage } from '../../lib/page/page.js';
import {
  Observable,
  observable
} from '../../lib/element/observation/observable.js';
import { formatDate } from '../../lib/intl.js';
import { html } from '../../lib/template.js';

// TODO - refactor
import { trash } from '../../design/leafygreen/icons/trash.js';

await i18nImport(['validation', 'broker-type']);

export class BrokersPage extends BasePage {
  @observable
  columns;

  @observable
  table;

  async removeBroker(_id) {
    this.busy = true;
    this.app.toast.source = this;
    this.toastTitle = i18n.t('$pages.brokers.toast.title');

    try {
      const deletion = await this.app.ppp.user.functions.deleteOne(
        {
          collection: 'brokers'
        },
        {
          _id
        }
      );

      if (deletion.deletedCount > 0) {
        this.table.rows.splice(
          this.table.rows.findIndex((r) => r.datum._id === _id),
          1
        );

        Observable.notify(this.table, 'rows');

        this.app.toast.appearance = 'success';
        this.toastText = i18n.t('operationDone');
      } else {
        this.app.toast.appearance = 'warning';
        this.toastText = 'Не удалось выполнить удаление';
      }

      this.app.toast.dismissible = true;
      this.app.toast.visible = true;
      this.busy = false;
    } catch (e) {
      console.error(e);

      this.app.toast.appearance = 'warning';
      this.app.toast.dismissible = true;
      this.toastText = i18n.t('operationFailedWithStatus', {
        status: e.status || 503
      });
      this.app.toast.visible = true;
    }
  }

  async fetchBrokers() {
    try {
      this.busy = true;
      this.app.toast.source = this;
      this.toastTitle = i18n.t('$pages.brokers.toast.title');

      this.table.rows = (
        await this.app.ppp.user.functions.find({
          collection: 'brokers'
        })
      ).map((datum) => {
        return {
          datum,
          cells: [
            datum._id,
            i18n.t(`$brokerType.${datum.type}`),
            formatDate(datum.created_at),
            html`
              <${'ppp-button'}
                class="xsmall"
                @click="${(x) => this.removeBroker(datum._id)}"
              >
                ${trash({})}
              </ppp-button>`
          ]
        };
      });

      this.busy = false;
    } catch (e) {
      console.error(e);

      this.app.toast.appearance = 'warning';
      this.app.toast.dismissible = true;
      this.toastText = i18n.t('operationFailedWithStatus', {
        status: e.status || 503
      });
      this.app.toast.visible = true;
    }
  }

  constructor(props) {
    super(props);

    this.columns = [
      {
        label: 'Название',
        sortBy: (d) => d._id
      },
      {
        label: 'Тип',
        sortBy: (d) => d.type
      },
      {
        label: 'Дата создания',
        sortBy: (d) => d.created_at
      },
      {
        label: 'Действия'
      }
    ];
  }

  connectedCallback() {
    super.connectedCallback();

    this.brokers = [];
    void this.fetchBrokers();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.brokers = [];
  }
}
