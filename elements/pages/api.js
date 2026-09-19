import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { APIS } from '../../lib/const.js';
import { search } from '../../static/svg/sprite.js';
import { filterCards } from '../generic-card.js';
import '../text-field.js';
import '../button.js';

await ppp.i18n(import.meta.url);

export const apiPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>${() => ppp.t('$apiPage.pageHeader')}</ppp-page-header>
      <ppp-text-field
        class="global-search-input"
        type="search"
        placeholder="${() => ppp.t('$apiPage.searchPlaceholder')}"
        @input="${(x, c) =>
          filterCards(x.cards.children, c.event.target.value)}"
      >
        <span class="icon" slot="end">${html.partial(search)}</span>
      </ppp-text-field>
      <div class="card-container" ${ref('cards')}>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Supabase"
            style="height: 40px"
            src="${() => ppp.brandSvg('supabase')}"
          />
          <span slot="title">Supabase</span>
          <span slot="description">
            ${() => ppp.t('$apiPage.supabaseDescription')}&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://supabase.com/"
              >${() => ppp.t('$apiPage.officialWebsite')}</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.SUPABASE}`
              })}"
          >
            ${() => ppp.t('$apiPage.continueButton')}
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Pusher"
            style="height: 32px"
            src="${() => ppp.brandSvg('pusher')}"
          />
          <span slot="title">Pusher</span>
          <span slot="description">
            ${() => ppp.t('$apiPage.pusherDescription')}&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://pusher.com/"
              >${() => ppp.t('$apiPage.officialWebsite')}</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.PUSHER}`
              })}"
          >
            ${() => ppp.t('$apiPage.continueButton')}
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="AstraDB"
            style="height: 32px"
            src="${() => ppp.brandSvg('astradb')}"
          />
          <span slot="title">DataStax Astra</span>
          <span slot="description">
            ${() => ppp.t('$apiPage.astraDbDescription')}&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://www.datastax.com/products/datastax-astra"
              >${() => ppp.t('$apiPage.officialWebsite')}</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.ASTRADB}`
              })}"
          >
            ${() => ppp.t('$apiPage.continueButton')}
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Northflank"
            style="height: 32px"
            src="${() => ppp.brandSvg('northflank')}"
          />
          <span slot="title">Northflank</span>
          <span slot="description">
            ${() => ppp.t('$apiPage.deploymentPlatformDescription')}&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://northflank.com/"
              >${() => ppp.t('$apiPage.officialWebsite')}</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.NORTHFLANK}`
              })}"
          >
            ${() => ppp.t('$apiPage.continueButton')}
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Render"
            style="height: 44px"
            src="${() => ppp.brandSvg('render')}"
          />
          <span slot="title">Render</span>
          <span slot="description">
            ${() => ppp.t('$apiPage.deploymentPlatformDescription')}&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://Render.com/"
              >${() => ppp.t('$apiPage.officialWebsite')}</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.RENDER}`
              })}"
          >
            ${() => ppp.t('$apiPage.continueButton')}
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Seatable"
            style="height: 36px"
            src="${() => ppp.brandSvg('seatable')}"
          />
          <span slot="title">Seatable</span>
          <span slot="description">
            ${() => ppp.t('$apiPage.seatableDescription')}&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://api.seatable.io/"
              >${() => ppp.t('$apiPage.documentation')}</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.SEATABLE}`
              })}"
          >
            ${() => ppp.t('$apiPage.continueButton')}
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Redis"
            style="height: 36px"
            src="${() => ppp.brandSvg('redis')}"
          />
          <span slot="title">Redis</span>
          <span slot="description">
            ${() => ppp.t('$apiPage.redisDescription')}
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.REDIS}`
              })}"
          >
            ${() => ppp.t('$apiPage.continueButton')}
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card hidden>
          <img
            slot="logo"
            draggable="false"
            alt="PostgreSQL"
            style="height: 40px;"
            src="${() => ppp.brandSvg('postgresql')}"
          />
          <span slot="title">PostgreSQL</span>
          <span slot="description">
            ${() => ppp.t('$apiPage.postgresqlDescription')}
          </span>
          <ppp-button
            disabled
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.POSTGRESQL}`
              })}"
          >
            ${() => ppp.t('$apiPage.continueButton')}
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Cloudflare"
            style="height: 32px"
            src="${() => ppp.brandSvg('cloudflare')}"
          />
          <span slot="title">Cloudflare</span>
          <span slot="description">
            ${() => ppp.t('$apiPage.cloudflareDescription')}
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.CLOUDFLARE}`
              })}"
          >
            ${() => ppp.t('$apiPage.continueButton')}
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Yandex Cloud"
            style="height: 32px"
            src="${() => ppp.brandSvg('yc')}"
          />
          <span slot="title">Yandex Cloud</span>
          <span slot="description">
            ${() => ppp.t('$apiPage.ycDescription')}
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `api-${APIS.YC}`
              })}"
          >
            ${() => ppp.t('$apiPage.continueButton')}
          </ppp-button>
        </ppp-generic-card>
      </div>
    </form>
  </template>
`;

export const apiPageStyles = css`
  ${pageStyles}
`;

export class ApiPage extends Page {}

export default ApiPage.compose({
  template: apiPageTemplate,
  styles: apiPageStyles
}).define();
