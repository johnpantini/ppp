import ppp from '../../ppp.js';
import { html, css, ref, Observable } from '../../vendor/fast-element.min.js';
import { validate } from '../../lib/ppp-errors.js';
import {
  Page,
  pageStyles,
  documentPageHeaderPartial,
  documentPageFooterPartial
} from '../page.js';
import '../badge.js';
import '../banner.js';
import '../button.js';
import '../checkbox.js';
import '../radio-group.js';
import '../text-field.js';

export const workspaceManagePageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      ${documentPageHeaderPartial({
        pageUrl: import.meta.url
      })}
      <section>
        <div class="label-group">
          <h5>Название терминала</h5>
          <p class="description">
            Название будет отображаться в боковой панели в списке терминалов.
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="PPP"
            value="${(x) => x.document.name}"
            ${ref('name')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Флаги</h5>
          <p class="description">Параметры, принимающие значение Да или Нет.</p>
        </div>
        <div class="input-group">
          <div class="control-stack">
            <ppp-checkbox
              ${ref('allowLockedWidgets')}
              ?checked="${(x) => x.document.allowLockedWidgets}"
            >
              Разрешить блокировку виджетов
            </ppp-checkbox>
            <ppp-banner class="inline" appearance="warning">
              Заблокированные виджеты не могут перемещаться или изменять размер.
            </ppp-banner>
          </div>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>Ансамбли виджетов</h5>
          <p class="description">
            Укажите режим синхронизации ансамблей виджетов для этого терминала.
          </p>
        </div>
        <div class="input-group">
          <ppp-radio-group
            orientation="vertical"
            value="${(x) => x.document.ensembleMode ?? 'default'}"
            ${ref('ensembleMode')}
          >
            <ppp-radio value="default">По умолчанию</ppp-radio>
            <ppp-radio value="group">
              Синхронизировать по виджетам группы
            </ppp-radio>
            <ppp-radio value="all">Синхронизировать по всем виджетам</ppp-radio>
          </ppp-radio-group>
        </div>
      </section>
      ${documentPageFooterPartial()}
    </form>
  </template>
`;

export const workspaceManagePageStyles = css`
  ${pageStyles}
`;

export class WorkspaceManagePage extends Page {
  collection = 'workspaces';

  async validate() {
    await validate(this.name);
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.collection%]')
        .findOne({
          _id: new BSON.ObjectId('[%#payload.documentId%]')
        });
    };
  }

  async find() {
    return {
      name: this.name.value.trim(),
      removed: { $ne: true }
    };
  }

  async submit() {
    if (this.document._id) {
      const index = ppp.workspaces.findIndex(
        (w) => w._id === this.document._id
      );

      if (index > -1) {
        ppp.workspaces[index] = Object.assign({}, ppp.workspaces[index], {
          name: this.name.value.trim()
        });

        const itemInSideNav = ppp.app.sideNav.querySelector(
          `[id="${this.document._id}"]`
        );

        if (itemInSideNav) {
          itemInSideNav.firstElementChild.textContent = this.name.value.trim();
        }

        Observable.notify(ppp.app, 'workspaces');
      }
    }

    return {
      $set: {
        name: this.name.value.trim(),
        allowLockedWidgets: this.allowLockedWidgets.checked,
        ensembleMode: this.ensembleMode.value,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }

  async cleanup() {
    const index = ppp.workspaces.findIndex((w) => w._id === this.document._id);

    if (index > -1) {
      ppp.workspaces.splice(index, 1);
      Observable.notify(ppp, 'workspaces');
    }
  }
}

export default WorkspaceManagePage.compose({
  template: workspaceManagePageTemplate,
  styles: workspaceManagePageStyles
}).define();
