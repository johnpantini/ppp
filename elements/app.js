/** @decorator */

import ppp from '../ppp.js';
import { PPPElement } from '../lib/ppp-element.js';
import {
  html,
  css,
  ref,
  observable,
  attr,
  when,
  repeat
} from '../vendor/fast-element.min.js';
import {
  bodyFont,
  paletteBlack,
  paletteWhite,
  themeConditional
} from '../design/design-tokens.js';
import { display } from '../vendor/fast-utilities.js';
import { hotkey, normalize } from '../design/styles.js';
import {
  workspaces,
  trading,
  cloud,
  plus,
  settings,
  services,
  extensions,
  connections
} from '../static/svg/sprite.js';
import './pages/not-found.js';
import './side-nav.js';

export const appTemplate = html`
  <template>
    <div class="holder">
      <div class="app-container">
        <ppp-side-nav
          ${ref('sideNav')}
          expandable
          ?expanded="${() => !ppp.settings.get('sideNavCollapsed')}"
          style="${(x) =>
            (ppp.settings.get('sideNavVisible') ?? true) ||
            x.page !== 'workspace'
              ? 'display: flex'
              : 'display: none'}"
        >
          <ppp-side-nav-item
            ?disabled="${() => !ppp.keyVault.ok()}"
            @click="${(x) => x.handleNewWorkspaceClick()}"
          >
            <span slot="start" class="action-icon">
              ${html.partial(plus)}
            </span>
            <span>Новый терминал</span>
          </ppp-side-nav-item>
          ${when(
            () => ppp.workspaces.length,
            html`
              <ppp-side-nav-group>
                <span slot="start"> ${html.partial(workspaces)} </span>
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
                  () => ppp.workspaces,
                  html`
                    <a
                      href="${(x) => `?page=workspace&document=${x._id}`}"
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
                    >
                      <ppp-side-nav-item
                        ?active="${(x, c) =>
                          c.parent.page === 'workspace' &&
                          c.parent.workspace === x._id}"
                        id="${(x) => x._id}"
                      >
                        <span>${(x) => x.name}</span>
                      </ppp-side-nav-item>
                    </a>
                  `
                )}
              </ppp-side-nav-group>
            `
          )}
          <ppp-side-nav-group>
            <span slot="start"> ${html.partial(trading)} </span>
            <span slot="title">Торговля</span>
            <a
              href="?page=widgets"
              @click="${(x) =>
                x.navigate({
                  page: 'widgets'
                })}"
            >
              <ppp-side-nav-item
                ?disabled="${() => !ppp.keyVault.ok()}"
                ?active="${(x) => x.page.startsWith('widget')}"
              >
                <span>Виджеты</span>
              </ppp-side-nav-item>
            </a>
            <a
              href="?page=instruments"
              @click="${(x) =>
                x.navigate({
                  page: 'instruments'
                })}"
            >
              <ppp-side-nav-item
                ?disabled="${() => !ppp.keyVault.ok()}"
                ?active="${(x) => x.page === 'instruments'}"
              >
                <span>Инструменты</span>
              </ppp-side-nav-item>
            </a>
            <a
              href="?page=workspaces"
              @click="${(x) =>
                x.navigate({
                  page: 'workspaces'
                })}"
            >
              <ppp-side-nav-item
                ?disabled="${() => !ppp.keyVault.ok()}"
                ?active="${(x) => x.page === 'workspaces'}"
              >
                <span>Терминалы</span>
              </ppp-side-nav-item>
            </a>
          </ppp-side-nav-group>
          <ppp-side-nav-group>
            <span slot="start"> ${html.partial(services)} </span>
            <span slot="title">Сервисы</span>
            <a
              href="?page=services"
              @click="${(x) =>
                x.navigate({
                  page: 'services'
                })}"
            >
              <ppp-side-nav-item
                ?disabled="${() => !ppp.keyVault.ok()}"
                ?active="${(x) => x.page === 'services'}"
              >
                <span>Список сервисов</span>
              </ppp-side-nav-item>
            </a>
            <a
              href="?page=service"
              @click="${(x) =>
                x.navigate({
                  page: 'service'
                })}"
            >
              <ppp-side-nav-item
                ?disabled="${() => !ppp.keyVault.ok()}"
                ?active="${(x) =>
                  x.page === 'service' || x.page.startsWith('service-')}"
              >
                <span>Установить сервис</span>
              </ppp-side-nav-item>
            </a>
          </ppp-side-nav-group>
          ${when(
            () => ppp.extensions.length,
            html`
              <ppp-side-nav-group>
                <span slot="start"> ${html.partial(extensions)} </span>
                <span slot="title">Дополнения</span>
                ${repeat(
                  () => ppp.extensions,
                  html`
                    <a
                      href="${(x) => `?page=${x.page}&extension=${x._id}`}"
                      @click="${(x, c) => {
                        c.parent.extension = x._id;

                        c.parent.navigate({
                          page: x.page,
                          extension: x._id
                        });
                      }}"
                    >
                      <ppp-side-nav-item
                        ?active="${(x, c) => c.parent.extension === x._id}"
                      >
                        <span> ${(x) => x.title} </span>
                      </ppp-side-nav-item>
                    </a>
                  `
                )}
              </ppp-side-nav-group>
            `
          )}
          <ppp-side-nav-group>
            <span slot="start"> ${html.partial(connections)} </span>
            <span slot="title">Подключения</span>
            <a
              href="?page=apis"
              @click="${(x) =>
                x.navigate({
                  page: 'apis'
                })}"
            >
              <ppp-side-nav-item
                ?disabled="${() => !ppp.keyVault.ok()}"
                ?active="${(x) => x.page.startsWith('api')}"
              >
                <span>Внешние API</span>
              </ppp-side-nav-item>
            </a>
            <a
              href="?page=brokers"
              @click="${(x) =>
                x.navigate({
                  page: 'brokers'
                })}"
            >
              <ppp-side-nav-item
                ?disabled="${() => !ppp.keyVault.ok()}"
                ?active="${(x) => x.page.startsWith('broker')}"
              >
                <span>Брокеры</span>
              </ppp-side-nav-item>
            </a>
            <a
              href="?page=traders"
              @click="${(x) =>
                x.navigate({
                  page: 'traders'
                })}"
            >
              <ppp-side-nav-item
                ?disabled="${() => !ppp.keyVault.ok()}"
                ?active="${(x) => x.page.startsWith('trader')}"
              >
                <span>Трейдеры</span>
              </ppp-side-nav-item>
            </a>
            <a
              href="?page=telegram-bots"
              @click="${(x) =>
                x.navigate({
                  page: 'telegram-bots'
                })}"
            >
              <ppp-side-nav-item
                ?disabled="${() => !ppp.keyVault.ok()}"
                ?active="${(x) => x.page.startsWith('telegram-bot')}"
              >
                <span>Боты Telegram</span>
              </ppp-side-nav-item>
            </a>
            <a
              href="?page=endpoints"
              @click="${(x) =>
                x.navigate({
                  page: 'endpoints'
                })}"
            >
              <ppp-side-nav-item
                ?disabled="${() => !ppp.keyVault.ok()}"
                ?active="${(x) => x.page.startsWith('endpoint')}"
              >
                <span>Конечные точки</span>
              </ppp-side-nav-item>
            </a>
            <a
              href="?page=servers"
              @click="${(x) =>
                x.navigate({
                  page: 'servers'
                })}"
            >
              <ppp-side-nav-item
                ?disabled="${() => !ppp.keyVault.ok()}"
                ?active="${(x) => x.page.startsWith('server')}"
              >
                <span>Серверы</span>
              </ppp-side-nav-item>
            </a>
          </ppp-side-nav-group>
          <ppp-side-nav-group>
            <span slot="start"> ${html.partial(settings)} </span>
            <span slot="title">Конфигурация</span>
            <a
              href="?page=cloud-services"
              @click="${(x) =>
                x.navigate({
                  page: 'cloud-services'
                })}"
            >
              <ppp-side-nav-item
                ?active="${(x) => x.page === 'cloud-services'}"
              >
                <span>Облачные сервисы</span>
              </ppp-side-nav-item>
            </a>
            <a
              href="?page=extensions"
              @click="${(x) =>
                x.navigate({
                  page: 'extensions'
                })}"
            >
              <ppp-side-nav-item
                ?disabled="${() => !ppp.keyVault.ok()}"
                ?active="${(x) => x.page === 'extensions'}"
              >
                <span>Дополнения</span>
              </ppp-side-nav-item>
            </a>
            <a
              href="?page=settings"
              @click="${(x) =>
                x.navigate({
                  page: 'settings'
                })}"
            >
              <ppp-side-nav-item
                ?disabled="${() => !ppp.keyVault.ok()}"
                ?active="${(x) => x.page === 'settings'}"
              >
                <span>Параметры</span>
              </ppp-side-nav-item>
            </a>
          </ppp-side-nav-group>
          <ppp-side-nav-group>
            <span slot="start"> ${html.partial(cloud)} </span>
            <span slot="title">Обновление</span>
            <a
              href="?page=updates"
              @click="${(x) =>
                x.navigate({
                  page: 'updates'
                })}"
            >
              <ppp-side-nav-item
                ?disabled="${(x) => !ppp.keyVault.ok()}"
                ?active="${(x) => x.page === 'updates'}"
              >
                <span>Центр обновлений</span>
              </ppp-side-nav-item>
            </a>
          </ppp-side-nav-group>
        </ppp-side-nav>
        <div ?workspace="${(x) => x.page === 'workspace'}" class="page-content">
          ${when(
            (x) => !x.pageConnected,
            html` <ppp-loader class="app-loader"></ppp-loader> `
          )}
          ${when(
            (x) => x.page,
            (x) =>
              html`${html.partial(
                `<ppp-${
                  x.page + (x.extension ? `-${x.extension}` : '')
                }-page></ppp-${x.page}-page>`
              )}`
          )}
          ${when(
            (x) => x.pageNotFound,
            html` <ppp-not-found-page></ppp-not-found-page>`
          )}
          <ppp-modal ${ref('mountPointModal')} hidden dismissible>
            <span slot="title" ${ref('mountPointTitle')}></span>
            <div class="mount" slot="body" ${ref('mountPoint')}></div>
          </ppp-modal>
        </div>
      </div>
    </div>
  </template>
`;

export const appStyles = css`
  ${display('flex')}
  ${normalize()}
  ${hotkey()}
  :host {
    position: relative;
    font-family: ${bodyFont};
    flex-direction: column;
    flex-grow: 1;
    width: 100%;
    height: 100%;
  }

  .holder {
    display: flex;
    position: relative;
    flex-direction: column;
    flex-grow: 1;
    width: 100%;
    background-color: ${themeConditional(paletteWhite, paletteBlack)};
  }

  .app-container,
  .page-content {
    position: relative;
    display: flex;
    flex-grow: 1;
  }

  ppp-side-nav {
    flex-shrink: 0;
    z-index: 20;
  }

  .app-loader {
    z-index: 10000000;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .page-content:not([workspace]) {
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 20px;
  }

  span[slot='start'] svg {
    width: 16px;
    height: 16px;
  }
`;

export class App extends PPPElement {
  #updateInterval = 30000;

  #toast;

  get toast() {
    if (!this.#toast) {
      this.#toast = document.body.querySelector('.toast').firstElementChild;
    }

    return this.#toast;
  }

  currentVersion = localStorage.getItem('ppp-version') ?? '1.0.0';

  lastVersion;

  #checkForAvailableUpdatesLoop() {
    if (!this.toast.hasAttribute('hidden')) {
      return setTimeout(
        () => this.#checkForAvailableUpdatesLoop(),
        this.#updateInterval
      );
    }

    fetch(`${ppp.rootUrl}/package.json`, {
      cache: 'no-store'
    })
      .then((response) => response.json())
      .then((pkg) => {
        this.lastVersion = pkg.version;

        const updateNeeded = this.updateNeeded();

        if (updateNeeded) {
          this.toast.title = 'Обновление готово';
          this.toast.text = html`Новая версия приложения (${this.lastVersion})
            готова к использованию.
            <a
              class="link"
              href="javascript:void(0);"
              @click="${() => this.updateApp(this.lastVersion)}"
            >
              Нажмите, чтобы обновиться.
            </a>`;
          this.toast.appearance = 'note';
          this.toast.removeAttribute('hidden');
        }

        setTimeout(
          () => this.#checkForAvailableUpdatesLoop(),
          this.#updateInterval
        );
      })
      .catch((e) => {
        console.error(e);

        setTimeout(
          () => this.#checkForAvailableUpdatesLoop(),
          this.#updateInterval * 4
        );
      });
  }

  updateNeeded() {
    if (typeof this.lastVersion !== 'string') {
      return false;
    }

    const lastVersion = this.lastVersion.split(/\./g);
    const currentVersion = this.currentVersion.split(/\./g);

    while (lastVersion.length || currentVersion.length) {
      const l = parseInt(lastVersion.shift());
      const c = parseInt(currentVersion.shift());

      if (l === c) continue;

      return l > c || isNaN(c);
    }

    return false;
  }

  async updateApp(lastVersion) {
    this.currentVersion = lastVersion;

    localStorage.setItem('ppp-version', lastVersion);
    await caches.delete('offline');
    this.toast.setAttribute('hidden', '');
    window.location.reload();
  }

  @attr
  page;

  @observable
  pageConnected;

  @observable
  pageNotFound;

  @attr
  workspace;

  @attr
  extension;

  #onPopState() {
    this.extension = this.params()?.extension;

    void this.navigate(this.url(this.params()));
  }

  constructor() {
    super();

    this.#checkForAvailableUpdatesLoop();

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        this.toast.setAttribute('hidden', '');
      }
    });

    this.page = this.params().page ?? 'cloud-services';
    window.addEventListener('popstate', this.#onPopState.bind(this));
  }

  connectedCallback() {
    super.connectedCallback();

    this.extension = this.params()?.extension;

    const params = this.params();

    this.navigate(
      this.url(
        Object.assign(params, {
          page: this.page
        })
      ),
      {
        replace: true
      }
    );
  }

  async mountPage(page, options = {}) {
    this.pageConnected = false;

    try {
      await import(`${ppp.rootUrl}/elements/pages/${page}.js`);

      const mountPoint = this.mountPoint;
      const pageElement = document.createElement(`ppp-${page}-page`);

      pageElement.mountPointModal = this.mountPointModal;
      pageElement.setAttribute('disable-auto-read', '');
      mountPoint.firstChild && mountPoint.removeChild(mountPoint.firstChild);

      this.mountPointTitle.textContent = options.title ?? 'PPP';
      this.mountPointModal.setAttribute('class', options.size ?? 'large');
      this.mountPointModal.removeAttribute('hidden');

      return mountPoint.appendChild(pageElement);
    } finally {
      this.pageConnected = true;
    }
  }

  query(params = {}) {
    const filtered = {};

    for (const p of Object.keys(params)) {
      if (typeof params[p] !== 'undefined') filtered[p] = params[p];
    }

    return new URLSearchParams(filtered).toString();
  }

  setURLSearchParams(params = {}) {
    const searchParams = new URLSearchParams(
      window.location.search.substring(1)
    );

    for (const param of Object.keys(params)) {
      searchParams.set(param, params[param]);
    }

    window.history.replaceState(
      '',
      '',
      `${window.location.origin}${
        window.location.pathname
      }?${searchParams.toString()}`
    );
  }

  params() {
    return Object.fromEntries(
      new URLSearchParams(window.location.search).entries()
    );
  }

  url(query) {
    if (query === null) return location.pathname;

    if (typeof query === 'object') query = this.query(query);

    if (query) return location.pathname + '?' + query;
    else return location.pathname + location.search;
  }

  async navigate(url, params = {}) {
    this.pageConnected = false;

    this.toast.setAttribute('hidden', '');

    if (typeof url === 'object') url = this.url(url);

    if (url === window.location.pathname + window.location.search)
      params.replace = true;

    if (params.replace)
      window.history.replaceState({}, '', params.replaceUrl ?? url);
    else window.history.pushState({}, '', url);

    // Force unload
    this.page = 'blank';
    this.page = this.params().page;

    if (this.page === 'workspace') {
      this.workspace = this.params().document;
    }

    if (this.page) {
      try {
        const extensionId = this.params().extension;

        if (extensionId) {
          const extension = ppp.extensions.find((e) => e._id === extensionId);

          if (extension) {
            if (extension.url.startsWith('/')) {
              extension.url = ppp.rootUrl + extension.url;
            }

            const eUrl = new URL(extension.url);
            const baseExtensionUrl = eUrl.href.slice(
              0,
              eUrl.href.lastIndexOf('/')
            );
            const pageUrl = `${baseExtensionUrl}/elements/pages/${this.page}.js`;
            const module = await import(pageUrl);

            await module.extension?.({
              ppp,
              baseExtensionUrl,
              metaUrl: import.meta.url,
              extension
            });
          } else {
            this.pageNotFound = true;

            return;
          }
        } else {
          this.extension = void 0;

          await import(`./pages/${this.page}.js`);
          localStorage.setItem('ppp-last-visited-url', location.search);
        }

        this.pageNotFound = false;
      } catch (e) {
        console.error(e);

        this.pageNotFound = true;
      } finally {
        this.pageConnected = true;
      }
    } else {
      return this.navigate({ page: 'cloud-services' });
    }
  }

  getVisibleModal() {
    return (
      this.shadowRoot.querySelector('ppp-modal:not([hidden])') ??
      this.shadowRoot
        .querySelector(`ppp-${this.page}-page`)
        .shadowRoot.querySelector('ppp-modal:not([hidden])')
    );
  }

  async showWidgetSelector() {
    const page = await ppp.app.mountPage('widget-selector-modal', {
      title: 'Разместить виджет',
      size: 'auto'
    });

    await page.populateDocuments();
  }
}

export default App.compose({
  template: appTemplate,
  styles: appStyles
}).define();
