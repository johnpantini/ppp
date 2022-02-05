import { ServiceSshPage } from '../../../shared/pages/service-ssh.js';
import { html } from '../../../shared/template.js';
import { ref } from '../../../shared/element/templating/ref.js';
import { children } from '../../../shared/element/templating/children.js';
import { when } from '../../../shared/element/templating/when.js';
import { css } from '../../../shared/element/styles/css.js';
import { repeat } from '../../../shared/element/templating/repeat.js';
import { pageStyles, loadingIndicator } from '../page.js';
import { stateAppearance } from './services.js';
import { formatDate } from '../../../shared/intl.js';
import { settings } from '../icons/settings.js';
import { caretDown } from '../icons/caret-down.js';
import { trash } from '../icons/trash.js';

export const serviceSshPageTemplate = (context, definition) => html`
  <template>
    <${'ppp-page-header'} ${ref('header')}>
      Сервисы - команды SSH
    </ppp-page-header>
    <form ${ref('form')} novalidate onsubmit="return false">
      <div class="loading-wrapper" ?busy="${(x) => x.busy}">
        ${when(
          (x) => x.service,
          html`
            <div class="section-content horizontal-overflow">
              <div class="service-details">
                <div class="service-details-controls">
                  <div class="service-details-control service-details-label">
                    ${(x) => x.service.name}
                  </div>
                  <div
                    class="service-details-control"
                    style="justify-content: left"
                  >
                    <${'ppp-button'}
                      ?disabled="${(x) => x.busy || x.service?.removed}"
                      appearance="danger"
                      @click="${(x) => x.remove()}">Удалить
                    </ppp-button>
                  </div>
                  <div class="service-details-control">
                    <${'ppp-badge'}
                      appearance="${(x) => stateAppearance(x.service.state)}">
                      ${(x) => x.t(`$const.serviceState.${x.service.state}`)}
                    </ppp-badge>
                    <ppp-badge
                      appearance="blue">
                      Последняя версия
                    </ppp-badge>
                  </div>
                </div>
                <div class="service-details-info">
                  <div class="service-details-info-container">
                    <span style="grid-column-start: 1;grid-row-start: 1;">
                      Версия
                    </span>
                    <div style="grid-column-start: 1;grid-row-start: 2;">
                      ${(x) => x.service.version}
                    </div>
                    <span style="grid-column-start: 2;grid-row-start: 1;">
                    Тип
                    </span>
                    <div style="grid-column-start: 2;grid-row-start: 2;">
                      ${(x) => x.t(`$const.service.${x.service.type}`)}
                    </div>
                    <span style="grid-column-start: 3;grid-row-start: 1;">
                    Создан
                    </span>
                    <div style="grid-column-start: 3;grid-row-start: 2;">
                      ${(x) => formatDate(x.service.createdAt)}
                    </div>
                    <span style="grid-column-start: 4;grid-row-start: 1;">
                    Последнее изменение
                    </span>
                    <div style="grid-column-start: 4;grid-row-start: 2;">
                      ${(x) =>
                        formatDate(x.service.updatedAt ?? x.service.createdAt)}
                    </div>
                    <span style="grid-column-start: 5;grid-row-start: 1;">
                    Удалён
                    </span>
                    <div style="grid-column-start: 5;grid-row-start: 2;">
                      ${(x) => (x.service.removed ? 'Да' : 'Нет')}
                    </div>
                  </div>
                </div>
              </div>
            </div>`
        )}
        <section>
          <div class="label-group">
            <h5>Название сервиса</h5>
            <p>Произвольное имя, чтобы ссылаться на этот профиль, когда
              потребуется.</p>
          </div>
          <div class="input-group">
            <ppp-text-field
              placeholder="Название"
              value="${(x) => x.service?.name}"
              ${ref('serviceName')}
            ></ppp-text-field>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Профиль сервера</h5>
          </div>
          <div class="input-group">
            <${'ppp-select'}
              ?disabled="${(x) => !x.servers}"
              placeholder="Нет доступных профилей"
              value="${(x) => x.service?.serverId}"
              ${ref('server')}
            >
              ${repeat(
                (x) => x?.servers,
                html`
                  <ppp-option
                    ?removed="${(x) => x.removed}"
                    value="${(x) => x._id}"
                  >
                    ${(x) => x.name}
                  </ppp-option>
                `
              )}
              ${when(
                (x) => x.servers !== null,
                caretDown({
                  slot: 'indicator'
                })
              )}
              ${when(
                (x) => x.servers === null,
                settings({
                  slot: 'indicator',
                  cls: 'spinner-icon'
                })
              )}
            </ppp-select>
            <${'ppp-button'}
              class="margin-top"
              @click="${(x) =>
                x.app.navigate({
                  page: 'server-selector'
                })}"
              appearance="primary"
            >
              Добавить сервер
            </ppp-button>
          </div>
        </section>
        <section>
          <div class="label-group">
            <h5>Секреты</h5>
            <p>Конфиденциальные данные, которые будут сохранены в зашифрованном
              виде.</p>
          </div>
          <div class="input-group" ${children({
            property: 'domSecrets',
            subtree: true,
            selector: 'ppp-text-field'
          })}>
            ${repeat(
              (x) => x.secrets,
              html`
                <div class="action-input">
                  <ppp-text-field
                    class="action-input-text"
                    type="password"
                    value="${(x) => x}"
                    placeholder="Значение"
                  >
                  </ppp-text-field>
                  <${'ppp-button'}
                    appearance="default"
                    class="small action-input-button"
                    @click="${(x, c) => c.parent.secrets.splice(c.index, 1)}"
                  >
                    ${trash({ size: 14 })}
                  </ppp-button>
                </div>
              `,
              { positioning: true }
            )}
            <${'ppp-button'}
              class="margin-top"
              @click="${(x) => x.addSecret()}"
              appearance="primary"
            >
              Добавить секрет
            </ppp-button>
          </div>
        </section>
        <section>
          <div class="label-group full">
            <h5>Команды создания</h5>
            <p>Список команд оболочки для выполнения при создании/обновлении
              сервиса.
              Поддерживаются только RHEL-совместимые операционные системы.</p>
            <${'ppp-codeflask'}
              :code="${(x) => x.service?.installCode ?? 'echo 42'}"
              ${ref('installCode')}
            ></ppp-codeflask>
          </div>
        </section>
        <section>
          <div class="label-group full">
            <h5>Команды удаления</h5>
            <p>Список команд оболочки для выполнения при удалении сервиса.
              Поддерживаются только RHEL-совместимые операционные системы.</p>
            <${'ppp-codeflask'}
              :code="${(x) => x.service?.removeCode ?? `echo 'Bye'`}"
              ${ref('removeCode')}
            ></ppp-codeflask>
          </div>
        </section>
        <${'ppp-modal'} ${ref('terminalModal')}>
          <span slot="title">Настройка сервиса</span>
          <div slot="body">
            <div class="description">
              <${'ppp-terminal'} ${ref('terminalDom')}></ppp-terminal>
            </div>
          </div>
        </ppp-modal>
        ${when((x) => x.busy, html`${loadingIndicator()}`)}
      </div>
      <section class="last">
        <div class="footer-actions">
          <${'ppp-button'}
            ?disabled="${(x) => x.busy || x.service?.removed}"
            type="submit"
            @click="${(x) => x.install()}"
            appearance="primary"
          >
            ${(x) =>
              x.service ? 'Переустановить сервис' : 'Установить сервис'}
          </ppp-button>
        </div>
      </section>
    </form>
    </div>
  </template>
`;

export const serviceSshPageStyles = (context, definition) =>
  css`
    ${pageStyles}
    section ppp-codeflask {
      width: 100%;
      height: 256px;
    }

    ppp-modal .description {
      padding: 10px 16px 10px 20px;
      border-radius: 7px;
      background-color: rgb(33, 49, 60);
      border: 1px solid rgb(231, 238, 236);
    }
  `;

// noinspection JSUnusedGlobalSymbols
export const serviceSshPage = ServiceSshPage.compose({
  baseName: 'service-ssh-page',
  template: serviceSshPageTemplate,
  styles: serviceSshPageStyles
});
