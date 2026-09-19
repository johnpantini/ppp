import ppp from '../../ppp.js';
import { html, css, ref } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { validate, invalidate, maybeFetchError } from '../../lib/ppp-errors.js';
import '../button.js';
import '../checkbox.js';
import '../text-field.js';

await ppp.i18n(import.meta.url);

export const settingsWorkspacePageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$settingsWorkspacePage.widgetSnapping')}</h5>
          <p class="description">
            ${() => ppp.t('$settingsWorkspacePage.widgetSnappingDescription')}
          </p>
        </div>
        <div class="input-group">
          <div class="settings-grid snap">
            <div class="row">
              <ppp-text-field
                type="number"
                min="0"
                placeholder="5"
                value="${(x) => x.document.workspaceSnapDistance ?? '5'}"
                ${ref('workspaceSnapDistance')}
              >
                <span slot="label">
                  ${() => ppp.t('$settingsWorkspacePage.snapDistance')}
                </span>
              </ppp-text-field>
              <ppp-text-field
                type="number"
                min="0"
                placeholder="1"
                value="${(x) => x.document.workspaceSnapMargin ?? '1'}"
                ${ref('workspaceSnapMargin')}
              >
                <span slot="label">
                  ${() => ppp.t('$settingsWorkspacePage.snapMargin')}
                </span>
              </ppp-text-field>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$settingsWorkspacePage.confirmWidgetClosing')}</h5>
          <p class="description">
            ${() =>
              ppp.t('$settingsWorkspacePage.confirmWidgetClosingDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-checkbox
            ?checked="${(x) => x.document.confirmWidgetClosing ?? false}"
            ${ref('confirmWidgetClosing')}
          >
            ${() => ppp.t('$settingsWorkspacePage.confirmWidgetClosing')}
          </ppp-checkbox>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>
            ${() => ppp.t('$settingsWorkspacePage.widgetNotificationTimeout')}
          </h5>
          <p class="description">
            ${() =>
              ppp.t(
                '$settingsWorkspacePage.widgetNotificationTimeoutDescription'
              )}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="number"
            min="0"
            placeholder="3000"
            value="${(x) => x.document.widgetNotificationTimeout ?? '3000'}"
            ${ref('widgetNotificationTimeout')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$settingsWorkspacePage.psinaBaseUrl')}</h5>
          <p class="description">
            ${() => ppp.t('$settingsWorkspacePage.psinaBaseUrlDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            type="url"
            placeholder="https://psina.pages.dev"
            value="${(x) =>
              x.document.psinaBaseUrl ?? 'https://psina.pages.dev'}"
            ${ref('psinaBaseUrl')}
          ></ppp-text-field>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>
            ${() => ppp.t('$settingsWorkspacePage.emptyWorkspaceInstallation')}
          </h5>
        </div>
        <div class="input-group">
          <ppp-checkbox
            ?checked="${(x) => x.document.hideEmptyWorkspaceGizmo ?? false}"
            ${ref('hideEmptyWorkspaceGizmo')}
          >
            ${() => ppp.t('$settingsWorkspacePage.doNotShow')}
          </ppp-checkbox>
        </div>
      </section>
      <section>
        <div class="label-group">
          <h5>${() => ppp.t('$settingsWorkspacePage.debugSettings')}</h5>
          <p class="description">
            ${() => ppp.t('$settingsWorkspacePage.debugSettingsDescription')}
          </p>
        </div>
        <div class="input-group">
          <ppp-text-field
            placeholder="*"
            value="${(x) => x.document.debugEnvVar ?? ''}"
            ${ref('debugEnvVar')}
          >
            <span slot="label">
              ${() => ppp.t('$settingsWorkspacePage.debugNamespaces')}
            </span>
          </ppp-text-field>
          <div class="spacing2"></div>
          <ppp-checkbox
            ?checked="${(x) => x.document.useDebugColors ?? true}"
            ${ref('useDebugColors')}
          >
            ${() => ppp.t('$settingsWorkspacePage.useDebugColors')}
          </ppp-checkbox>
        </div>
      </section>
      <footer>
        <ppp-button
          type="submit"
          appearance="primary"
          @click="${(x) => x.submitDocument()}"
        >
          ${() => ppp.t('$settingsWorkspacePage.saveSettings')}
        </ppp-button>
      </footer>
    </form>
  </template>
`;

export const settingsWorkspacePageStyles = css`
  ${pageStyles}
`;

export class SettingsWorkspacePage extends Page {
  collection = 'app';

  getDocumentId() {
    return {
      _id: '@settings'
    };
  }

  async read() {
    return Object.fromEntries(ppp.settings);
  }

  async validate() {
    await validate(this.workspaceSnapDistance);
    await validate(this.workspaceSnapMargin);
    await validate(this.psinaBaseUrl);

    for (const input of [
      this.workspaceSnapDistance,
      this.workspaceSnapMargin
    ]) {
      await validate(input, {
        hook: async (value) => value >= 0,
        errorMessage: ppp.t('$settingsWorkspacePage.valueMustBeNonNegative')
      });
    }

    await validate(this.workspaceSnapMargin, {
      hook: async (value) => value <= +this.workspaceSnapDistance.value,
      errorMessage: ppp.t('$settingsWorkspacePage.valueMustBeNotGreater', {
        max: this.workspaceSnapDistance.value
      })
    });

    try {
      await maybeFetchError(
        await fetch(
          new URL('/widgets/psina.js', this.psinaBaseUrl.value).toString()
        )
      );
    } catch (e) {
      invalidate(this.psinaBaseUrl, {
        errorMessage: ppp.t('$page.urlCannotBeUsed'),
        raiseException: true
      });
    }
  }

  async submit() {
    const workspaceSnapDistance = Math.trunc(this.workspaceSnapDistance.value);
    const workspaceSnapMargin = Math.trunc(this.workspaceSnapMargin.value);
    const confirmWidgetClosing = this.confirmWidgetClosing.checked;
    const hideEmptyWorkspaceGizmo = this.hideEmptyWorkspaceGizmo.checked;
    const debugEnvVar = this.debugEnvVar.value.trim();
    const useDebugColors = this.useDebugColors.checked;
    const widgetNotificationTimeout = Math.abs(
      Math.trunc(this.widgetNotificationTimeout.value)
    );
    const psinaBaseUrl = new URL(this.psinaBaseUrl.value).origin;

    ppp.settings.set('workspaceSnapDistance', workspaceSnapDistance);
    ppp.settings.set('workspaceSnapMargin', workspaceSnapMargin);
    ppp.settings.set('confirmWidgetClosing', confirmWidgetClosing);
    ppp.settings.set('widgetNotificationTimeout', widgetNotificationTimeout);
    ppp.settings.set('psinaBaseUrl', psinaBaseUrl);
    ppp.settings.set('hideEmptyWorkspaceGizmo', hideEmptyWorkspaceGizmo);
    ppp.settings.set('debugEnvVar', debugEnvVar);
    ppp.settings.set('useDebugColors', useDebugColors);

    return {
      $set: {
        workspaceSnapDistance,
        workspaceSnapMargin,
        confirmWidgetClosing,
        widgetNotificationTimeout,
        psinaBaseUrl,
        hideEmptyWorkspaceGizmo,
        debugEnvVar,
        useDebugColors
      }
    };
  }
}

export default SettingsWorkspacePage.compose({
  template: settingsWorkspacePageTemplate,
  styles: settingsWorkspacePageStyles
}).define();
