import { bodyFont } from './design-tokens.js';
import { css } from '../../lib/element/styles/css.js';
import { display } from '../../lib/utilities/style/display.js';
import { html, requireComponent } from '../../lib/template.js';
import { when } from '../../lib/element/templating/when.js';
import { ref } from '../../lib/element/templating/ref.js';
import { repeat } from '../../lib/element/templating/repeat.js';

import { basePageStyles, circleSvg, loadingIndicator } from './styles/page.js';

import { plus } from './icons/plus.js';
import { apps } from './icons/apps.js';
import { charts } from './icons/charts.js';
import { settings } from './icons/settings.js';
import { support } from './icons/support.js';

const page = (page, condition) => {
  return when(
    (x) =>
      x.setPageTemplate(
        condition &&
          x.page === page &&
          requireComponent(
            `ppp-${page}-page`,
            `../${globalThis.ppp.appType}/${page}.js`
          )
      ),
    html`
      <ppp-${page}-page :app="${(x) => x}"></ppp-${page}-page>`
  );
};

const newWorkSpaceModalTemplate = html`
  <ppp-modal ${ref('newWorkspaceModal')} dismissible>
    <span slot="title">Новый терминал</span>
    <div slot="body">
      <div class="description">
        Будет создано новое рабочее пространство для торговли. Как
        назовём?
      </div>
      <form ${ref('newWorkspaceModalForm')} id="new-workspace"
            name="new-workspace"
            onsubmit="return false">
        <div class="loading-wrapper" ?busy="${(x) => x.busy}">
          <section>
            <div class="section-index-icon">
              ${circleSvg(1)}
            </div>
            <div class="label-group full">
              <h6>Название</h6>
              <p>Будет отображаться в боковой панели.</p>
              <ppp-text-field
                placeholder="Название пространства"
                name="workspace-name"
                ${ref('workspaceName')}
              ></ppp-text-field>
            </div>
          </section>
          <section class="last">
            <div class="section-index-icon">
              ${circleSvg(2)}
            </div>
            <div class="label-group full">
              <h6>Комментарий</h6>
              <${'ppp-text-field'}
                optional
                placeholder="Произвольное описание"
                name="workspace-comment"
                ${ref('workspaceComment')}
              ></ppp-text-field>
            </div>
          </section>
          ${when((x) => x.busy, html`${loadingIndicator()}`)}
          <div class="footer-border"></div>
          <footer>
            <div class="footer-actions">
              <${'ppp-button'}
                @click="${(x) => (x.newWorkspaceModal.visible = false)}">Отмена
              </ppp-button>
              <ppp-button
                style="margin-left: 10px;"
                appearance="primary"
                ?disabled="${(x) => x.busy}"
                type="submit"
                @click="${(x) => x.createWorkspace()}"
              >
                ${when(
                  (x) => x.busy,
                  settings({
                    slot: 'end',
                    cls: 'spinner-icon'
                  })
                )}
                Создать
              </ppp-button>
            </div>
          </footer>
        </div>
      </form>
    </div>
  </ppp-modal>
`;

// noinspection JSUnusedGlobalSymbols
export const appTemplate = (context, definition) => html`
  <template>
    ${when((x) => x.ppp?.keyVault.ok(), newWorkSpaceModalTemplate)}
    <div class="holder">
      <div class="app-container">
        <${'ppp-side-nav'} ${ref('sideNav')}
                           ?expanded="${(x) => !x.settings.sideNavCollapsed}">
          <${'ppp-side-nav-item'}
            ?disabled="${(x) => !x.ppp?.keyVault.ok()}"
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
                <span slot="title">Терминалы</span>
                ${repeat(
                  (x) => x.workspaces,
                  html`
                    <ppp-side-nav-item
                      @click="${(x, c) => (c.parent.workspace = x.uuid)}"
                      ?active="${(x, c) =>
                        c.parent.workspace === x.uuid &&
                        c.parent.page === 'workspace'}"
                      slot="items"
                      id="${(x) => x.uuid}"
                    >
                      <span slot="title">${(x) => x._id}</span>
                    </ppp-side-nav-item>
                  `
                )}
              </ppp-side-nav-group>
            `
          )}
          <${'ppp-side-nav-group'}>
            ${charts({
              slot: 'start'
            })}
            <span slot="title">Торговля</span>
            <ppp-side-nav-item
              ?disabled="${(x) => !x.ppp?.keyVault.ok()}"
              ?active="${(x) => x.page === 'widgets'}"
              @click="${(x) => (x.page = 'widgets')}"
              slot="items"
            >
              <span slot="title">Виджеты</span>
            </ppp-side-nav-item>
            <ppp-side-nav-item
              ?disabled="${(x) => !x.ppp?.keyVault.ok()}"
              ?active="${(x) => x.page === 'services' || x.page === 'service'}"
              @click="${(x) => (x.page = 'services')}"
              slot="items"
            >
              <span slot="title">Сервисы</span>
            </ppp-side-nav-item>
            <ppp-side-nav-item
              ?disabled="${(x) => !x.ppp?.keyVault.ok()}"
              ?active="${(x) => x.page === 'instruments'}"
              @click="${(x) => (x.page = 'instruments')}"
              slot="items"
            >
              <span slot="title">Инструменты</span>
            </ppp-side-nav-item>
          </ppp-side-nav-group>
          <ppp-side-nav-group>
            ${settings({
              slot: 'start'
            })}
            <span slot="title">Параметры</span>
            <ppp-side-nav-item
              ?active="${(x) => x.page === 'cloud-services'}"
              @click="${(x) => (x.page = 'cloud-services')}"
              slot="items"
            >
              <span slot="title">Облачные сервисы</span>
            </ppp-side-nav-item>
            <ppp-side-nav-item
              ?disabled="${(x) => !x.ppp?.keyVault.ok()}"
              ?active="${(x) => x.page === 'brokers' || x.page === 'broker'}"
              @click="${(x) => (x.page = 'brokers')}"
              slot="items"
            >
              <span slot="title">Брокеры</span>
            </ppp-side-nav-item>
            <ppp-side-nav-item
              ?disabled="${(x) => !x.ppp?.keyVault.ok()}"
              ?active="${(x) => x.page === 'servers' || x.page === 'server'}"
              @click="${(x) => (x.page = 'servers')}"
              slot="items"
            >
              <span slot="title">Серверы</span>
            </ppp-side-nav-item>
            <ppp-side-nav-item
              ?disabled="${(x) => !x.ppp?.keyVault.ok()}"
              ?active="${(x) =>
                x.page === 'telegram-bots' || x.page === 'telegram-bot'}"
              @click="${(x) => (x.page = 'telegram-bots')}"
              slot="items"
            >
              <span slot="title">Боты Telegram</span>
            </ppp-side-nav-item>
            <ppp-side-nav-item
              ?disabled="${(x) => !x.ppp?.keyVault.ok()}"
              ?active="${(x) => x.page === 'warden'}"
              @click="${(x) => (x.page = 'warden')}"
              slot="items"
            >
              <span slot="title">Warden</span>
            </ppp-side-nav-item>
            <ppp-side-nav-item
              ?disabled="${(x) => !x.ppp?.keyVault.ok()}"
              ?active="${(x) => x.page === 'workspaces'}"
              @click="${(x) => (x.page = 'workspaces')}"
              slot="items"
            >
              <span slot="title">Терминалы</span>
            </ppp-side-nav-item>
            <ppp-side-nav-item
              ?disabled="${(x) => !x.ppp?.keyVault.ok()}"
              ?active="${(x) => x.page === 'updates'}"
              @click="${(x) => (x.page = 'updates')}"
              slot="items"
            >
              <span slot="title">${i18n.t('update')}</span>
            </ppp-side-nav-item>
          </ppp-side-nav-group>
          <ppp-side-nav-group>
            ${support({
              slot: 'start'
            })}
            <span slot="title">${i18n.t('help')}</span>
            <ppp-side-nav-item
              @click="${() =>
                window
                  .open(
                    'https://pantini.gitbook.io/pantini-co/ppp/getting-started',
                    '_blank'
                  )
                  .focus()}"
              slot="items"
            >
              <span slot="title">Инструкции</span>
            </ppp-side-nav-item>
          </ppp-side-nav-group>
        </ppp-side-nav>
        <div class="page-content">${(app) => html`
          ${when((x) => !x.pageConnected, html`
            <div class="loading-indicator-content">
              <div class="loading-indicator xlarge"></div>
            </div>
          `)}
          ${page('cloud-services', true)}
          ${page('workspace', app.ppp?.keyVault.ok())}
          ${page('workspaces', app.ppp?.keyVault.ok())}
          ${page('service', app.ppp?.keyVault.ok())}
          ${page('services', app.ppp?.keyVault.ok())}
          ${page('broker', app.ppp?.keyVault.ok())}
          ${page('brokers', app.ppp?.keyVault.ok())}
          ${page('server', app.ppp?.keyVault.ok())}
          ${page('servers', app.ppp?.keyVault.ok())}
          ${page('telegram-bots', app.ppp?.keyVault.ok())}
          ${page('telegram-bot', app.ppp?.keyVault.ok())}
          ${page('updates', app.ppp?.keyVault.ok())}
          ${when(
            (x) =>
              !x.pageHasTemplate &&
              requireComponent(
                'ppp-not-found-page',
                `../${globalThis.ppp.appType}/not-found.js`
              ),
            html` <ppp-not-found-page :app="${(x) => x}"></ppp-not-found-page>`
          )}
        `}
        </div>
      </div>
    </div>
  </template>
`;

// TODO - refactor modal styles
// noinspection JSUnusedGlobalSymbols
export const appStyles = (context, definition) =>
  css`
    ${basePageStyles}
    ${display('flex')}
    :host {
      font-family: ${bodyFont};
      flex-direction: column;
      flex-grow: 1;
      position: relative;
      width: 100%;
    }

    ppp-modal:not(:defined) {
      visibility: hidden;
      position: absolute;
      height: 0;
    }

    ppp-modal .description {
      margin: unset;
      font-family: ${bodyFont};
      color: rgb(33, 49, 60);
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0;
      font-weight: 400;
      margin-bottom: 1rem;
      margin-right: 2rem;
    }

    ppp-modal section {
      margin-bottom: 11px;
      padding: 5px 5px 16px 5px;
    }

    ppp-modal footer {
      margin-bottom: -16px;
      padding-top: 16px;
    }

    ppp-modal .footer-actions {
      display: flex;
      justify-content: flex-end;
    }

    ppp-modal .footer-border {
      border-bottom: 1px solid #ebebed;
      margin-left: -32px;
      margin-top: 0;
      width: 750px;
    }

    ppp-modal .label-group > h6 {
      font-size: 0.9rem;
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
      z-index: 10;
    }

    .page-content {
      flex-direction: column;
      min-width: 0;
      padding-left: 20px;
      padding-right: 20px;
      padding-top: 20px;
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

    .loading-indicator {
      background: url("data:image/svg+xml,%3C%3Fxml version%3D%221.0%22 encoding%3D%22utf-8%22%3F%3E%3Csvg width%3D'50px' height%3D'50px' xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 100 100%22 preserveAspectRatio%3D%22xMidYMid%22 class%3D%22uil-ellipsis%22%3E%3Ccircle cx%3D%2216%22 cy%3D%2250%22 r%3D%2215%22 fill%3D%22%23403d3d%22 transform%3D%22rotate(0 50 50)%22%3E%3Canimate id%3D%22anir11%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%2215%22 begin%3D%220s%3Banir14.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir12%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%2215%22 begin%3D%22anir11.end%22 dur%3D%220.625s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir13%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%220%22 begin%3D%22anir12.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir14%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%220%22 begin%3D%22anir13.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix11%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%220s%3Banix18.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix12%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%22anix11.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix13%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2250%22 begin%3D%22anix12.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix14%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2250%22 begin%3D%22anix13.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix15%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2284%22 begin%3D%22anix14.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix16%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%22anix15.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix17%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%22anix16.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix18%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2216%22 begin%3D%22anix17.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3C%2Fcircle%3E%3Ccircle cx%3D%2250%22 cy%3D%2250%22 r%3D%2215%22 fill%3D%22%23808a80%22 transform%3D%22rotate(0 50 50)%22%3E%3Canimate id%3D%22anir21%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%2215%22 begin%3D%220s%3Banir25.end%22 dur%3D%220.5s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir22%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%220%22 begin%3D%22anir21.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir23%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%220%22 begin%3D%22anir22.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir24%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%2215%22 begin%3D%22anir23.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir25%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%2215%22 begin%3D%22anir24.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix21%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2250%22 begin%3D%220s%3Banix28.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix22%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2250%22 begin%3D%22anix21.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix23%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2284%22 begin%3D%22anix22.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix24%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%22anix23.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix25%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%22anix24.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix26%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2216%22 begin%3D%22anix25.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix27%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%22anix26.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix28%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%22anix27.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3C%2Fcircle%3E%3Ccircle cx%3D%2284%22 cy%3D%2250%22 r%3D%2215%22 fill%3D%22%23403d3d%22 transform%3D%22rotate(0 50 50)%22%3E%3Canimate id%3D%22anir31%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%2215%22 begin%3D%220s%3Banir35.end%22 dur%3D%220.25s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir32%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%220%22 begin%3D%22anir31.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir33%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%220%22 begin%3D%22anir32.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir34%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%2215%22 begin%3D%22anir33.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir35%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%2215%22 begin%3D%22anir34.end%22 dur%3D%220.375s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix31%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2284%22 begin%3D%220s%3Banix38.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix32%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%22anix31.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix33%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%22anix32.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix34%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2216%22 begin%3D%22anix33.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix35%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%22anix34.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix36%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%22anix35.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix37%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2250%22 begin%3D%22anix36.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix38%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2250%22 begin%3D%22anix37.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3C%2Fcircle%3E%3Ccircle cx%3D%2284%22 cy%3D%2250%22 r%3D%2215%22 fill%3D%22%23808a80%22 transform%3D%22rotate(0 50 50)%22%3E%3Canimate id%3D%22anir41%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%220%22 begin%3D%220s%3Banir44.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir42%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%220%22 begin%3D%22anir41.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir43%22 attributeName%3D%22r%22 from%3D%220%22 to%3D%2215%22 begin%3D%22anir42.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anir44%22 attributeName%3D%22r%22 from%3D%2215%22 to%3D%2215%22 begin%3D%22anir43.end%22 dur%3D%220.625s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix41%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%220s%3Banix48.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix42%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2216%22 begin%3D%22anix41.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix43%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%22anix42.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix44%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2216%22 begin%3D%22anix43.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix45%22 attributeName%3D%22cx%22 from%3D%2216%22 to%3D%2250%22 begin%3D%22anix44.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix46%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2250%22 begin%3D%22anix45.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix47%22 attributeName%3D%22cx%22 from%3D%2250%22 to%3D%2284%22 begin%3D%22anix46.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3Canimate id%3D%22anix48%22 attributeName%3D%22cx%22 from%3D%2284%22 to%3D%2284%22 begin%3D%22anix47.end%22 dur%3D%220.125s%22 fill%3D%22freeze%22%3E%3C%2Fanimate%3E%3C%2Fcircle%3E%3C%2Fsvg%3E") no-repeat;
      background-size: 100%;
      min-height: 10px;
      width: 15px;
      margin-left: 10px;
      display: inline-block;
    }

    .loading-indicator.xlarge {
      width: 45px;
      min-height: 45px;
    }
  `;
