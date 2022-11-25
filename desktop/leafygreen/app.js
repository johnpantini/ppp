import { App as BaseApp } from '../../shared/app.js';
import { css } from '../../shared/element/styles/css.js';
import { display } from '../../shared/utilities/style/display.js';
import { html, requireComponent } from '../../shared/template.js';
import { when } from '../../shared/element/templating/when.js';
import { ref } from '../../shared/element/templating/ref.js';
import { repeat } from '../../shared/element/templating/repeat.js';
import { bodyFont } from './design-tokens.js';
import { keyCodeEscape } from '../../shared/web-utilities/key-codes.js';
import { pageStyles } from './page.js';
import { plus } from './icons/plus.js';
import { apps } from './icons/apps.js';
import { code } from './icons/code.js';
import { timeSeries } from './icons/time-series.js';
import { building } from './icons/building.js';
import { settings } from './icons/settings.js';
import { connect } from './icons/connect.js';
import { cloud } from './icons/cloud.js';
import ppp from '../../ppp.js';

// noinspection JSUnusedGlobalSymbols
export const appTemplate = (context, definition) => html`
  <template>
    ${when(
      () => ppp?.keyVault.ok(),
      html`
        <ppp-modal ${ref('newWorkspaceModal')} dismissible>
          <span slot="title">Новый терминал</span>
          <div slot="body">
            <div class="description">
              Будет создано новое рабочее пространство для торговли. Как
              назовём?
            </div>
            <ppp-new-workspace-modal-page></ppp-new-workspace-modal-page>
          </div>
        </ppp-modal>
        <ppp-modal ${ref('terminalModal')}>
          <span slot="title" ${ref('terminalModalTitle')}>
            Ход выполнения операции
          </span>
          <div slot="body" class="terminal-modal">
            <div class="description">
              <ppp-terminal ${ref('terminalWindow')}></ppp-terminal>
            </div>
          </div>
        </ppp-modal>
      `
    )}
    ${when(
      () => ppp?.keyVault.ok(),
      html`
        <ppp-modal ${
          /**
           * @var widgetSelectorModal
           */
          ref('widgetSelectorModal')
        } dismissible>
          <span slot="title">Разместить виджет</span>
          <div slot="body">
            <div class="description">
              Чтобы разместить виджет на текущей рабочей области, нажмите кнопку&nbsp;
              <${'ppp-button'}
                class="xsmall"
                style="position: relative; top: -4px;"
              >
                Выбрать
              </ppp-button>&nbsp;
              в соответствующей строке таблицы.
            </div>
            <ppp-widget-selector-modal-page ${ref(
              'widgetSelectorModalPage'
            )}></ppp-widget-selector-modal-page>
          </div>
        </ppp-modal>
      `
    )}
    <div class="holder">
      <div class="app-container">
        <${'ppp-side-nav'}
          ${
            /**
             * @var sideNav
             */
            ref('sideNav')
          }
          ?expanded="${(x) => !x.settings.sideNavCollapsed}"
          style="${(x) =>
            (x.settings.sideNavVisible ?? true) || x.page !== 'workspace'
              ? 'display: initial'
              : 'display: none'}"
        >
          <${'ppp-side-nav-item'}
            ?disabled="${() => !ppp?.keyVault.ok()}"
            @click="${(x) => x.handleNewWorkspaceClick()}"
          >
            ${plus({
              slot: 'start',
              cls: 'action-icon'
            })}
            <span slot="title">Новый терминал</span>
          </ppp-side-nav-item>
          ${when(
            (x) => x.workspaces.length,
            html`
              <${'ppp-side-nav-group'}>
                ${apps({
                  slot: 'start'
                })}
                ${when(
                  (x) => x.page === 'workspace',
                  html` <code
                    class="hotkey"
                    slot="end"
                    @click="${() => ppp.app.showWidgetSelector()}"
                    >+W</code
                  >`
                )}
                <span slot="title">Терминалы</span>
                ${repeat(
                  (x) => x.workspaces,
                  html`
                    <ppp-side-nav-item
                      class="ellipsis"
                      @click="${(x, c) => {
                        if (
                          c.event.target
                            ?.closest('ppp-side-nav-item')
                            ?.hasAttribute('active')
                        )
                          return false;

                        c.parent.navigate({
                          page: 'workspace',
                          document: x._id
                        });
                      }}"
                      ?active="${(x, c) =>
                        c.parent.page === 'workspace' &&
                        c.parent.workspace === x._id}"
                      slot="items"
                      id="${(x) => x._id}"
                    >
                      <span slot="title">${(x) => x.name}</span>
                    </ppp-side-nav-item>
                  `
                )}
              </ppp-side-nav-group>
            `
          )}
          <${'ppp-side-nav-group'}>
            ${timeSeries({
              slot: 'start'
            })}
            <span slot="title">Торговля</span>
            <ppp-side-nav-item
              ?disabled="${() => !ppp?.keyVault.ok()}"
              ?active="${(x) => x.page.startsWith('widget')}"
              @click="${(x) =>
                x.navigate({
                  page: 'widgets'
                })}"
              slot="items"
            >
              <span slot="title">Виджеты</span>
            </ppp-side-nav-item>
            <ppp-side-nav-item
              ?disabled="${() => !ppp?.keyVault.ok()}"
              ?active="${(x) => x.page === 'instruments'}"
              @click="${(x) =>
                x.navigate({
                  page: 'instruments'
                })}"
              slot="items"
            >
              <span slot="title">Инструменты</span>
            </ppp-side-nav-item>
            <ppp-side-nav-item
              ?disabled="${() => !ppp?.keyVault.ok()}"
              ?active="${(x) => x.page === 'workspaces'}"
              @click="${(x) =>
                x.navigate({
                  page: 'workspaces'
                })}"
              slot="items"
            >
              <span slot="title">Терминалы</span>
            </ppp-side-nav-item>
          </ppp-side-nav-group>
          <ppp-side-nav-group>
            ${building({
              slot: 'start'
            })}
            <span slot="title">Сервисы</span>
            <ppp-side-nav-item
              ?disabled="${() => !ppp?.keyVault.ok()}"
              ?active="${(x) => x.page === 'services'}"
              @click="${(x) =>
                x.navigate({
                  page: 'services'
                })}"
              slot="items"
            >
              <span slot="title">Список</span>
            </ppp-side-nav-item>
            <ppp-side-nav-item
              ?disabled="${() => !ppp?.keyVault.ok()}"
              ?active="${(x) =>
                x.page === 'service' || x.page.startsWith('service-')}"
              @click="${(x) =>
                x.navigate({
                  page: 'service'
                })}"
              slot="items"
            >
              <span slot="title">Установить сервис</span>
            </ppp-side-nav-item>
          </ppp-side-nav-group>
          ${when(
            (x) => x.extensions.length,
            html`
              <${'ppp-side-nav-group'}>
                ${code({
                  slot: 'start'
                })}
                <span slot="title">Дополнения</span>
                ${repeat(
                  (x) => x.extensions,
                  html`
                    <ppp-side-nav-item
                      @click="${(x, c) => {
                        c.parent.extension = x._id;

                        c.parent.navigate({
                          page: x.page,
                          extension: x._id
                        });
                      }} }"
                      ?active="${(x, c) => c.parent.extension === x._id}"
                      slot="items"
                    >
                      <span slot="title">${(x) => x.title}</span>
                    </ppp-side-nav-item>
                  `
                )}
              </ppp-side-nav-group>
            `
          )}
          <ppp-side-nav-group>
            ${connect({
              slot: 'start'
            })}
            <span slot="title">Подключения</span>
            <ppp-side-nav-item
              ?disabled="${() => !ppp?.keyVault.ok()}"
              ?active="${(x) => x.page.startsWith('api')}"
              @click="${(x) =>
                x.navigate({
                  page: 'apis'
                })}"
              slot="items"
            >
              <span slot="title">Внешние API</span>
            </ppp-side-nav-item>
            <ppp-side-nav-item
              ?disabled="${() => !ppp?.keyVault.ok()}"
              ?active="${(x) => x.page.startsWith('broker')}"
              @click="${(x) =>
                x.navigate({
                  page: 'brokers'
                })}"
              slot="items"
            >
              <span slot="title">Брокеры</span>
            </ppp-side-nav-item>
            <ppp-side-nav-item
              ?disabled="${() => !ppp?.keyVault.ok()}"
              ?active="${(x) => x.page.startsWith('trader')}"
              @click="${(x) =>
                x.navigate({
                  page: 'traders'
                })}"
              slot="items"
            >
              <span slot="title">Трейдеры</span>
            </ppp-side-nav-item>
            <ppp-side-nav-item
              ?disabled="${() => !ppp?.keyVault.ok()}"
              ?active="${(x) => x.page.startsWith('telegram-bot')}"
              @click="${(x) =>
                x.navigate({
                  page: 'telegram-bots'
                })}"
              slot="items"
            >
              <span slot="title">Боты Telegram</span>
            </ppp-side-nav-item>
            <ppp-side-nav-item
              ?disabled="${() => !ppp?.keyVault.ok()}"
              ?active="${(x) => x.page.startsWith('endpoint')}"
              @click="${(x) =>
                x.navigate({
                  page: 'endpoints'
                })}"
              slot="items"
            >
              <span slot="title">Конечные точки</span>
            </ppp-side-nav-item>
          </ppp-side-nav-group>
          <ppp-side-nav-group>
            ${settings({
              slot: 'start'
            })}
            <span slot="title">Конфигурация</span>
            <ppp-side-nav-item
              ?active="${(x) => x.page === 'cloud-services'}"
              @click="${(x) =>
                x.navigate({
                  page: 'cloud-services'
                })}"
              slot="items"
            >
              <span slot="title">Облачные сервисы</span>
            </ppp-side-nav-item>
            <ppp-side-nav-item
              ?disabled="${() => !ppp?.keyVault.ok()}"
              ?active="${(x) => x.page === 'extensions'}"
              @click="${(x) =>
                x.navigate({
                  page: 'extensions'
                })}"
              slot="items"
            >
              <span slot="title">Дополнения</span>
            </ppp-side-nav-item>
          </ppp-side-nav-group>
          <ppp-side-nav-group>
            ${cloud({
              slot: 'start'
            })}
            <span slot="title">Обновление</span>
            <ppp-side-nav-item
              ?disabled="${(x) => !ppp?.keyVault.ok()}"
              ?active="${(x) => x.page === 'updates'}"
              @click="${(x) =>
                x.navigate({
                  page: 'updates'
                })}"
              slot="items"
            >
              <span slot="title">Проверить</span>
            </ppp-side-nav-item>
          </ppp-side-nav-group>
        </ppp-side-nav>
        <div ?workspace="${(x) => x.page === 'workspace'}" class="page-content">
          ${() => html`
            ${when(
              (x) => !x.pageConnected,
              html`
                <div class="loading-indicator-content">
                  <div class="loading-indicator xlarge"></div>
                </div>
              `
            )}
            ${(x) => html`
              <ppp-${
                x.page + (x.extension ? `-${x.extension}` : '')
              }-page></ppp-${x.page}-page>`}
            ${when(
              (x) => x.pageNotFound && requireComponent('ppp-not-found-page'),
              html` <ppp-not-found-page></ppp-not-found-page>`
            )}
          `}
        </div>
      </div>
    </div>
  </template>
`;

// noinspection JSUnusedGlobalSymbols
export const appStyles = (context, definition) =>
  css`
    ${pageStyles}
    ${display('flex')}
    :host {
      font-family: ${bodyFont};
      flex-direction: column;
      flex-grow: 1;
      position: relative;
      width: 100%;
    }

    .holder {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      position: relative;
      width: 100%;
    }

    .app-container,
    .page-content {
      display: flex;
      flex-grow: 1;
    }

    ppp-side-nav {
      flex-shrink: 0;
      z-index: 20;
    }

    .page-content:not([workspace]) {
      flex-direction: column;
      min-width: 0;
      padding-left: 20px;
      padding-right: 20px;
      padding-top: 20px;
    }

    .page-content[workspace] {
      flex-direction: column;
      min-width: 0;
    }

    .loading-indicator-content {
      opacity: 0.5;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .action-icon {
      color: #007cad;
    }

    .hotkey {
      user-select: none;
      font-family: 'Source Code Pro', Menlo, monospace;
      border: 1px solid rgb(28, 45, 56);
      border-radius: 3px;
      padding-left: 5px;
      padding-right: 5px;
      color: rgb(0, 30, 43);
      background-color: rgb(255, 255, 255);
      font-size: 15px;
      line-height: 22px;
      cursor: pointer;
      transition: all 150ms ease-in-out 0s;
    }

    .hotkey:hover {
      background-color: rgb(228, 244, 228);
    }

    .terminal-modal .description {
      padding: 10px 16px 10px 20px;
      border-radius: 7px;
      background-color: rgb(33, 49, 60);
      border: 1px solid rgb(231, 238, 236);
    }
  `;

export class App extends BaseApp {
  _toast;

  constructor() {
    super(...arguments);

    document.addEventListener(
      'keydown',
      (e) => {
        if (e.code === keyCodeEscape) {
          this.toast.visible = false;
        }
      },
      {
        passive: true
      }
    );

    void requireComponent('ppp-toast');
  }

  navigate(url, params = {}) {
    super.navigate(url, params);

    this._toast && (this._toast.visible = false);
  }

  get toast() {
    if (!this._toast) {
      this._toast = document.body.querySelector('.toast').firstElementChild;
    }

    return this._toast;
  }
}

export const app = (styles, template) =>
  App.compose({
    template,
    styles
  });
