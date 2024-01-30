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
  repeat,
  Observable,
  Updates
} from '../vendor/fast-element.min.js';
import {
  bodyFont,
  paletteBlack,
  paletteRedBase,
  paletteRedDark1,
  paletteRedLight3,
  paletteWhite,
  spacing2,
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
  extensions,
  connections,
  expand,
  warning
} from '../static/svg/sprite.js';
import './button.js';
import './draggable-stack.js';
import './modal.js';
import './pages/not-found.js';
import './side-nav.js';

await ppp.i18n(import.meta.url);

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
            <span>${() => ppp.t('$sideNav.newWorkspace')}</span>
          </ppp-side-nav-item>
          ${when(
            () => ppp.workspaces.length,
            html`
              <ppp-side-nav-group>
                <span slot="start">${html.partial(workspaces)}</span>
                ${when(
                  (x) => x.page === 'workspace',
                  html`
                    <code
                      class="hotkey"
                      slot="end"
                      @click="${() => ppp.app.showWidgetSelector()}"
                      >+W</code
                    >
                  `
                )}
                <span slot="title">
                  ${() => ppp.t('$collection.workspaces')}
                </span>
                <ppp-draggable-stack ${ref('workspaceDragList')}>
                  ${repeat(
                    () =>
                      ppp.workspaces.sort(
                        (a, b) => (a.order ?? 0) - (b.order ?? 0)
                      ),
                    html`
                      <a
                        class="draggable drag-handle"
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
                </ppp-draggable-stack>
              </ppp-side-nav-group>
            `
          )}
          <ppp-side-nav-group>
            <span slot="start">${html.partial(trading)}</span>
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
                <span>${() => ppp.t('$collection.widgets')}</span>
              </ppp-side-nav-item>
            </a>
            <a
              href="?page=orders"
              @click="${(x) =>
                x.navigate({
                  page: 'orders'
                })}"
            >
              <ppp-side-nav-item
                ?disabled="${() => !ppp.keyVault.ok()}"
                ?active="${(x) => x.page.startsWith('order')}"
              >
                <span>${() => ppp.t('$collection.orders')}</span>
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
                <span>${() => ppp.t('$collection.instruments')}</span>
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
                <span>${() => ppp.t('$collection.workspaces')}</span>
              </ppp-side-nav-item>
            </a>
          </ppp-side-nav-group>
          ${when(
            () => ppp.extensions.length,
            html`
              <ppp-side-nav-group>
                <span slot="start">${html.partial(extensions)}</span>
                <span slot="title">
                  ${() => ppp.t('$collection.extensions')}
                </span>
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
                        id="${(x) => x._id}"
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
            <span slot="start">${html.partial(connections)}</span>
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
                <span>${() => ppp.t('$collection.apis')}</span>
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
                <span>${() => ppp.t('$collection.brokers')}</span>
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
                <span>${() => ppp.t('$collection.traders')}</span>
              </ppp-side-nav-item>
            </a>
            <a
              href="?page=bots"
              @click="${(x) =>
                x.navigate({
                  page: 'bots'
                })}"
            >
              <ppp-side-nav-item
                ?disabled="${() => !ppp.keyVault.ok()}"
                ?active="${(x) => x.page.startsWith('bot')}"
              >
                <span>${() => ppp.t('$collection.bots')}</span>
              </ppp-side-nav-item>
            </a>
            <a
              href="?page=services"
              @click="${(x) =>
                x.navigate({
                  page: 'services'
                })}"
            >
              <ppp-side-nav-item
                ?disabled="${() => !ppp.keyVault.ok()}"
                ?active="${(x) => x.page.startsWith('service')}"
              >
                <span>${() => ppp.t('$collection.services')}</span>
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
            <span slot="start">${html.partial(settings)}</span>
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
                <span>${() => ppp.t('$collection.extensions')}</span>
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
                <span>${() => ppp.t('$collection.settings')}</span>
              </ppp-side-nav-item>
            </a>
          </ppp-side-nav-group>
          <ppp-side-nav-group>
            <span slot="start">${html.partial(cloud)}</span>
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
          <ppp-side-nav-group class="expando">
            <ppp-side-nav-item @click="${(x) => x.expandCollapseSideNav()}">
              <span
                slot="start"
                class="action-icon"
                style="${(x) =>
                  x.sideNav.expanded ? '' : 'transform: rotate(180deg)'}"
              >
                ${html.partial(expand)}
              </span>
            </ppp-side-nav-item>
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
          <ppp-modal ${ref('confirmationModal')} with-icon hidden dismissible>
            <div slot="title-icon">${html.partial(warning)}</div>
            <span slot="title" ${ref('confirmationModalTitle')}></span>
            <span slot="description" ${ref('confirmationModalDescription')}>
            </span>
            <div slot="body">
              <div class="modal-footer">
                <ppp-button
                  appearance="default"
                  @click="${(x) => {
                    x.confirmationModal.setAttribute('hidden', '');

                    x.confirmationModal.result = false;
                  }}"
                >
                  Отмена
                </ppp-button>
                <ppp-button
                  appearance="danger"
                  @click="${(x) => {
                    x.confirmationModal.setAttribute('hidden', '');

                    x.confirmationModal.result = true;
                  }}"
                >
                  Подтвердить
                </ppp-button>
              </div>
            </div>
          </ppp-modal>
          <ppp-modal ${ref('terminalModal')} class="auto" hidden>
            <span slot="title" ${ref('terminalModalTitle')}>
              Настройка компонентов приложения
            </span>
            <div slot="body" class="terminal-modal-body">
              <ppp-terminal ${ref('terminalWindow')}></ppp-terminal>
            </div>
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

  .terminal-modal-body {
    padding: 10px 36px 40px 36px;
    border-radius: 4px;
    margin-bottom: 0;
  }

  div[slot='title-icon'] {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: 36px;
    top: 40px;
    background: ${themeConditional(paletteRedLight3, paletteRedDark1)};
  }

  div[slot='title-icon'] svg {
    width: 16px;
    height: 16px;
    margin-top: -3px;
    color: ${themeConditional(paletteRedBase, paletteRedLight3)};
    flex-shrink: 0;
  }

  .modal-footer {
    position: relative;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    gap: 0 ${spacing2};
    justify-content: right;
    flex-direction: row;
    padding: 24px 35px 35px;
  }

  ppp-draggable-stack a {
    text-decoration: none;
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

  #rafQueue = new Set();

  #rafReqID;

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
    ppp.app.toast.appearance = 'progress';
    ppp.app.toast.dismissible = false;
    ppp.app.toast.title = 'Идёт обновление';
    ppp.app.toast.text = 'Страница будет перезагружена автоматически.';

    Updates.enqueue(async () => {
      ppp.app.toast.progress.value = 0;

      // Sync fork
      const updatesPage = await ppp.app.mountPage('updates', {
        stayHidden: true
      });

      this.currentVersion = lastVersion;

      localStorage.setItem('ppp-version', lastVersion);

      ppp.app.toast.progress.value = 45;

      await caches.delete('offline');
      await updatesPage.checkForUpdates(true);

      ppp.app.toast.progress.value = 75;

      await updatesPage.updateApp(true);

      ppp.app.toast.progress.value = 100;

      this.toast.setAttribute('hidden', '');
      window.location.reload();
    });
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

  widgetClipboard;

  #onPopState() {
    this.extension = this.params()?.extension;

    void this.navigate(this.url(this.params()));
  }

  expandCollapseSideNav() {
    const expanded = this.sideNav.hasAttribute('expanded');

    if (expanded) {
      this.sideNav.removeAttribute('expanded');
    } else {
      this.sideNav.setAttribute('expanded', '');
    }

    ppp.settings.set('sideNavCollapsed', expanded);
  }

  rafLoop() {
    for (const fn of this.#rafQueue) {
      fn();
    }

    if (this.#rafQueue.size) {
      this.#rafReqID = window.requestAnimationFrame(this.rafLoop);
    }
  }

  rafEnqueue(fn) {
    this.#rafQueue.add(fn);

    if (!this.#rafReqID) {
      this.#rafReqID = window.requestAnimationFrame(this.rafLoop);
    }
  }

  rafDequeue(fn) {
    this.#rafQueue.delete(fn);

    if (!this.#rafQueue.size) {
      if (this.#rafReqID) {
        window.cancelAnimationFrame(this.#rafReqID);

        this.#rafReqID = null;
      }
    }
  }

  constructor() {
    super();

    this.rafLoop = this.rafLoop.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.#checkForAvailableUpdatesLoop();

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        this.toast.setAttribute('hidden', '');

        if (ppp.settings.get('closeModalsOnEsc')) {
          this.getVisibleModal()?.close();
        }
      }
    });

    this.page = this.params().page ?? 'cloud-services';
    window.addEventListener('popstate', this.#onPopState.bind(this));
  }

  async onDragEnd() {
    const nodes = this.workspaceDragList.nodes();

    await ppp.user.functions.bulkWrite(
      {
        collection: 'workspaces'
      },
      nodes.map((n, index) => {
        return {
          updateOne: {
            filter: {
              _id: n.querySelector('[id]').getAttribute('id')
            },
            update: {
              $set: {
                order: index + 1
              }
            },
            upsert: true
          }
        };
      }),
      {
        ordered: true
      }
    );
  }

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('pppdragend', this.onDragEnd);

    const that = this;

    Observable.getNotifier(this.mountPointModal).subscribe(
      {
        handleChange(mountPointModal) {
          if (mountPointModal.hasAttribute('hidden')) {
            const mountPoint = that.mountPoint;

            mountPoint.firstChild &&
              mountPoint.removeChild(mountPoint.firstChild);
          }
        }
      },
      'hidden'
    );

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

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('pppdragend', this.onDragEnd);
  }

  async mountPage(page, options = {}) {
    this.pageConnected = false;

    try {
      const mountPoint = this.mountPoint;

      // Widget settings modify min-height.
      this.mountPointModal.content.style['min-height'] = 'unset';

      mountPoint.firstChild && mountPoint.removeChild(mountPoint.firstChild);

      let importPath = `${ppp.rootUrl}/elements/pages/${page}.js`;

      if (options.importPath) {
        importPath = options.importPath;
      }

      await import(importPath);

      const pageElement = document.createElement(`ppp-${page}-page`);

      pageElement.mountPointModal = this.mountPointModal;

      if (!options.autoRead) {
        pageElement.setAttribute('disable-auto-read', '');
      }

      if (options.documentId) {
        pageElement.setAttribute('document-id', options.documentId);
      }

      pageElement.setAttribute('href', page);

      if (!options.adoptHeader) {
        this.mountPointTitle.textContent = options.title ?? 'PPP';
      } else {
        this.mountPointTitle.textContent = '';
      }

      this.mountPointModal.setAttribute('class', options.size ?? 'large');

      if (!options.stayHidden) {
        this.mountPointModal.removeAttribute('hidden');
      }

      const result = mountPoint.appendChild(pageElement);

      result.setAttribute('mounted', '');

      const header = pageElement.shadowRoot.querySelector('ppp-page-header');

      if (header) {
        header.style.display = 'none';

        if (options.adoptHeader) {
          this.mountPointTitle.textContent =
            header.titleContent.firstElementChild
              .assignedNodes()[0]
              .wholeText.trim();
        }
      }

      return result;
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
    } else {
      this.mountPointModal.setAttribute('hidden', '');
      this.confirmationModal.setAttribute('hidden', '');
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
        ?.shadowRoot.querySelector('ppp-modal:not([hidden])')
    );
  }

  async handleNewWorkspaceClick() {
    return ppp.app.mountPage('new-workspace-modal', {
      title: ppp.t('$sideNav.newWorkspace'),
      size: 'large'
    });
  }

  async showWidgetSelector() {
    const page = await ppp.app.mountPage('widget-selector-modal', {
      title: 'Разместить виджет',
      size: 'auto'
    });

    await page.populateDocuments();
  }

  async confirm(
    title = 'Подтвердите действие',
    description = 'Необходимо подтверждение, чтобы продолжить.'
  ) {
    this.confirmationModalTitle.textContent = title;
    this.confirmationModalDescription.textContent = description;
    this.confirmationModal.result = null;

    this.confirmationModal.removeAttribute('hidden');

    return new Promise((resolve) => {
      const notifier = Observable.getNotifier(this.confirmationModal);
      const handler = {
        handleChange: () => {
          notifier.unsubscribe(handler, 'result');

          resolve(this.confirmationModal.result);
        }
      };

      notifier.subscribe(handler, 'result');
    });
  }
}

export default App.compose({
  template: appTemplate,
  styles: appStyles
}).define();
