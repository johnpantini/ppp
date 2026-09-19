import ppp from '../../ppp.js';
import { html, css, ref, when } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { SERVICE_STATE, SERVICES, VERSIONING_STATUS } from '../../lib/const.js';
import { cloud, search } from '../../static/svg/sprite.js';
import { filterCards } from '../generic-card.js';
import '../text-field.js';
import '../button.js';
await ppp.i18n(import.meta.url);

export function serviceStateAppearance(document) {
  if (document.removed) return 'red';

  switch (document.state) {
    case SERVICE_STATE.ACTIVE:
      return 'green';
    case SERVICE_STATE.STOPPED:
      return 'lightgray';
    case SERVICE_STATE.FAILED:
      return 'red';
  }

  return 'lightgray';
}

export const servicePageHeaderExtraControls = html`
  <ppp-badge
    slot="controls"
    appearance="${(x) => serviceStateAppearance(x.document)}"
  >
    ${(x) => ppp.t(`$const.serviceState.${x.document.state}`)}
  </ppp-badge>
  <ppp-badge
    slot="controls"
    appearance="${(x) => {
      const vs = x.getVersioningStatus?.() ?? VERSIONING_STATUS.OK;

      if (vs === VERSIONING_STATUS.OK) return 'green';
      else if (vs === VERSIONING_STATUS.OLD) {
        return 'yellow';
      } else if (vs === VERSIONING_STATUS.OFF) {
        return 'blue';
      }
    }}"
  >
    ${(x) =>
      ppp.t(
        `$const.versioningStatus.${
          x.getVersioningStatus?.() ?? VERSIONING_STATUS.OK
        }`
      )}
  </ppp-badge>
  ${when(
    (x) =>
      typeof x.updateService === 'function' &&
      (x.getVersioningStatus?.() ?? VERSIONING_STATUS.OK) ===
        VERSIONING_STATUS.OLD,
    html`
      <ppp-button
        ?disabled="${(x) => !x.isSteady()}"
        slot="controls"
        appearance="primary"
        @click="${(x) => x.updateService?.()}"
      >
        ${() => ppp.t('$servicePage.update')}
        <span slot="start">${html.partial(cloud)}</span>
      </ppp-button>
    `
  )}
`;

export const servicePageFooterExtraControls = html`
  <ppp-button
    ?hidden="${(x) => !x.document._id}"
    ?disabled="${(x) =>
      !x.isSteady() ||
      x.document.removed ||
      x.document.state === SERVICE_STATE.FAILED}"
    @click="${(x) => x.restartService()}"
  >
    ${() => ppp.t('$servicePage.restart')}
  </ppp-button>
  <ppp-button
    ?hidden="${(x) => !x.document._id}"
    ?disabled="${(x) =>
      !x.isSteady() ||
      x.document.removed ||
      x.document.state === SERVICE_STATE.FAILED ||
      x.document.state === SERVICE_STATE.STOPPED}"
    @click="${(x) => x.stopService()}"
  >
    ${() => ppp.t('$servicePage.pause')}
  </ppp-button>
`;

export const servicePageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>${() => ppp.t('$collection.services')}</ppp-page-header>
      <ppp-text-field
        class="global-search-input"
        type="search"
        placeholder="${() => ppp.t('$servicePage.searchPlaceholder')}"
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
            alt="Cloudflare Worker"
            style="height: 40px;"
            src="${() => ppp.brandSvg('cloudflare-worker')}"
          />
          <span slot="title">Cloudflare Worker</span>
          <span slot="description">
            ${() => ppp.t('$servicePage.cloudflareWorkerDescription')}&nbsp;<a
              class="link"
              target="_blank"
              rel="noopener"
              href="https://workers.cloudflare.com/"
              >${() => ppp.t('$servicePage.officialWebsite')}</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `service-${SERVICES.CLOUDFLARE_WORKER}`
              })}"
          >
            ${() => ppp.t('$servicePage.continue')}
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card hidden>
          <img
            slot="logo"
            draggable="false"
            alt="${() => ppp.t('$servicePage.nyseNsdqHaltsTitle')}"
            style="height: 44px"
            src="${() => ppp.brandSvg('nsdq')}"
          />
          <span slot="title">
            ${() => ppp.t('$servicePage.nyseNsdqHaltsTitle')}
          </span>
          <span slot="description">
            ${() => ppp.t('$servicePage.nyseNsdqHaltsDescription')}
            <a
              class="link"
              target="_blank"
              rel="noopener"
              href="http://www.nasdaqtrader.com/rss.aspx?feed=tradehalts"
              >${() => ppp.t('$servicePage.haltsRssFeed')}</a
            >.
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `service-${SERVICES.NYSE_NSDQ_HALTS}`
              })}"
          >
            ${() => ppp.t('$servicePage.continue')}
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card hidden>
          <img
            slot="logo"
            draggable="false"
            alt="${() => ppp.t('$servicePage.supabaseParserTitle')}"
            style="height: 40px"
            src="${() => ppp.brandSvg('supabase')}"
          />
          <span slot="title">
            ${() => ppp.t('$servicePage.supabaseParserTitle')}
          </span>
          <span slot="description">
            ${() => ppp.t('$servicePage.supabaseParserDescription')}
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `service-${SERVICES.SUPABASE_PARSER}`
              })}"
          >
            ${() => ppp.t('$servicePage.continue')}
          </ppp-button>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Aspirant"
            style="height: 40px"
            src="${() => ppp.brandSvg('javascript')}"
          />
          <span slot="title">Aspirant</span>
          <span slot="description">
            ${() => ppp.t('$servicePage.aspirantDescription')}
          </span>
          <div slot="action" class="control-line">
            <ppp-button
              @click="${() =>
                ppp.app.navigate({
                  page: `service-${SERVICES.CLOUD_PPP_ASPIRANT}`
                })}"
            >
              ${() => ppp.t('$servicePage.inCloud')}
            </ppp-button>
            <ppp-button
              @click="${() =>
                ppp.app.navigate({
                  page: `service-${SERVICES.DEPLOYED_PPP_ASPIRANT}`
                })}"
            >
              ${() => ppp.t('$servicePage.byUrl')}
            </ppp-button>
            <ppp-button
              @click="${() =>
                ppp.app.navigate({
                  page: `service-${SERVICES.SYSTEMD_PPP_ASPIRANT}`
                })}"
            >
              Systemd
            </ppp-button>
          </div>
        </ppp-generic-card>
        <ppp-generic-card>
          <img
            slot="logo"
            draggable="false"
            alt="Aspirant Worker"
            style="height: 40px"
            src="${() => ppp.brandSvg('javascript-green')}"
          />
          <span slot="title">Aspirant Worker</span>
          <span slot="description">
            ${() => ppp.t('$servicePage.aspirantWorkerDescription')}
          </span>
          <ppp-button
            slot="action"
            @click="${() =>
              ppp.app.navigate({
                page: `service-${SERVICES.PPP_ASPIRANT_WORKER}`
              })}"
          >
            ${() => ppp.t('$servicePage.continue')}
          </ppp-button>
        </ppp-generic-card>
      </div>
    </form>
  </template>
`;

export const servicePageStyles = css`
  ${pageStyles}
`;

export class ServicePage extends Page {}

export default ServicePage.compose({
  template: servicePageTemplate,
  styles: servicePageStyles
}).define();
