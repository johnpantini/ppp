/** @decorator */

import { BasePage } from '../page.js';
import {
  Observable,
  observable
} from '../element/observation/observable.js';
import { requireComponent } from '../template.js';

export class WorkspacePage extends BasePage {
  #workspaceChangedHandler;

  @observable
  notFound;

  @observable
  widgets;

  @observable
  busy;

  constructor() {
    super();

    this.widgets = [];

    const that = this;

    this.#workspaceChangedHandler = {
      handleChange(source, propertyName) {
        if (source[propertyName]) void that.fetchWorkspace();
      }
    };
  }

  async fetchWorkspace() {
    try {
      this.busy = true;
      this.app.toast.source = this;
      this.toastTitle = 'Загрузка терминала';

      const index = this.app.workspaces.findIndex(
        (w) => w.uuid === this.app.workspace
      );

      if (index === -1) {
        this.notFound = true;

        await requireComponent(
          'ppp-not-found-page',
          `../${globalThis.ppp.appType}/not-found/not-found-page.js`
        );

        this.busy = false;
      } else {
        this.notFound = false;

        this.widgets = await this.app.ppp.user.functions.find({
          collection: 'widgets'
        }, {
          workspace_id: this.app.workspace
        });

        this.busy = false;
      }
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

  connectedCallback() {
    super.connectedCallback();

    this.widgets = [];

    Observable.getNotifier(this.app).subscribe(
      this.#workspaceChangedHandler,
      'workspace'
    );

    void this.fetchWorkspace();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.widgets = [];

    Observable.getNotifier(this.app).unsubscribe(
      this.#workspaceChangedHandler,
      'workspace'
    );
  }
}
