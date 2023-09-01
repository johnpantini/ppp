/** @decorator */

import ppp from '../ppp.js';
import { PPPElement } from '../lib/ppp-element.js';
import {
  html,
  css,
  observable,
  Observable,
  attr,
  ref,
  Updates,
  when
} from '../vendor/fast-element.min.js';
import { display } from '../vendor/fast-utilities.js';
import { ellipsis, normalize, spacing, typography } from '../design/styles.js';
import {
  paletteGrayDark2,
  paletteGrayLight2,
  themeConditional,
  paletteWhite,
  paletteBlack,
  spacing1,
  spacing2,
  spacing4,
  spacing3,
  paletteGrayBase,
  paletteGrayLight1
} from '../design/design-tokens.js';
import {
  PAGE_STATUS,
  SERVER_TYPES,
  SERVICE_STATE,
  VERSIONING_STATUS
} from '../lib/const.js';
import { Tmpl } from '../lib/tmpl.js';
import { uuidv4 } from '../lib/ppp-crypto.js';
import { parsePPPScript } from '../lib/ppp-script.js';
import { arrowLeft } from '../static/svg/sprite.js';
import {
  ConflictError,
  DocumentNotFoundError,
  FetchError,
  invalidate,
  maybeFetchError
} from '../lib/ppp-errors.js';
import './toast.js';

await ppp.i18n(import.meta.url);

(class PageHeader extends PPPElement {})
  .compose({
    template: html`
      <h3 class="title" ${ref('titleContent')}>
        <slot></slot>
      </h3>
      <div class="controls">
        <slot name="controls"></slot>
      </div>
    `,
    styles: css`
      ${display('flex')}
      ${normalize()}
      ${typography()}
      :host {
        position: relative;
        align-items: center;
        border-bottom: 3px solid
          ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
        flex-direction: row;
        justify-content: flex-start;
        margin: 0;
        padding-bottom: 15px;
        padding-top: 0;
        width: 100%;
      }

      .title {
        max-width: 70%;
        color: ${themeConditional(paletteBlack, paletteGrayLight2)};
        margin-right: 10px;
        ${ellipsis()};
      }

      .controls {
        align-items: center;
        display: flex;
        margin-left: auto;
      }

      .controls ::slotted(*) {
        margin-left: 14px;
      }
    `
  })
  .define();

export const documentPageHeaderPartial = ({
  pageUrl,
  extraControls = ''
} = {}) => {
  const [page, type] = pageUrl
    .split('pages/')[1]
    .split('.js')[0]
    .split(/(^[a-z0-9]+)-/i)
    .filter(Boolean);
  const collection = `${page}s`;

  return html`
    <ppp-page-header>
      ${(x) => {
        const nameParts = [ppp.t(`$collection.${collection}`)];

        if (type && type !== 'manage') {
          nameParts.push(ppp.t(`$const.${page}.${type}`));
        }

        if (page === 'endpoint') {
          nameParts.push(x.document.route);
        }

        if (x.document.name ?? x.document.title) {
          nameParts.push(x.document.name ?? x.document.title);
        }

        return nameParts.join(' - ');
      }}
      ${when(
        (x) => x.document._id,
        html`
          <ppp-badge
            ?hidden="${(x) => !x.document.removed}"
            slot="controls"
            appearance="red"
          >
            Документ удалён
          </ppp-badge>
          ${extraControls}
        `
      )}
      <ppp-button
        appearance="default"
        slot="controls"
        @click="${() =>
          ppp.app.navigate({
            page: collection
          })}"
      >
        Перейти к списку
        <span slot="start">${html.partial(arrowLeft)}</span>
      </ppp-button>
    </ppp-page-header>
  `;
};

export const documentPageFooterPartial = ({ text, extraControls } = {}) => html`
  <footer>
    ${extraControls}
    <ppp-button
      type="submit"
      appearance="primary"
      @click="${(x) => x.submitDocument()}"
    >
      ${text ?? 'Сохранить в PPP'}
    </ppp-button>
    <ppp-button
      ?hidden="${(x) => !x.document._id}"
      ?disabled="${(x) => !x.isSteady() || x.document.removed}"
      appearance="danger"
      @click="${(x) => x.cleanupAndRemoveDocument()}"
    >
      Удалить
    </ppp-button>
  </footer>
`;

export const pageStyles = css`
  ${normalize()}
  ${spacing()}
  ${typography()}
  :host(.page) {
    display: block;
    position: relative;
    width: 100%;
  }

  :host(.page) ppp-loader {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: none;
    z-index: 1;
  }

  :host(.page.loader-visible) ppp-loader {
    display: flex;
  }

  :host(.page.loader-visible) form {
    opacity: 0.5;
    pointer-events: none;
    user-select: none;
  }

  form[novalidate] {
    width: 100%;
    height: 100%;
  }

  footer,
  section {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    padding: 25px;
    border-bottom: 1px solid
      ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
  }

  footer {
    display: flex;
    gap: 0 ${spacing2};
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    flex-grow: 1;
    max-width: 100%;
    border-bottom: none;
  }

  footer {
    padding: 50px 25px 25px 25px;
  }

  .section-index-icon {
    align-self: start;
    display: flex;
    margin-right: 8px;
    width: 24px;
    height: 24px;
  }

  .section-index-icon svg circle {
    fill: ${themeConditional(paletteGrayDark2, paletteGrayLight2)};
    stroke: ${themeConditional(paletteGrayDark2, paletteGrayLight2)};
  }

  .section-index-icon svg text {
    fill: ${themeConditional(paletteWhite, paletteBlack)};
  }

  .label-group {
    width: 50%;
    flex-grow: 0;
    flex-shrink: 1;
    min-width: 50%;
    align-self: flex-start;
    max-width: 960px;
  }

  .label-group.full {
    width: 100%;
  }

  .input-group {
    flex-grow: 1;
    align-items: center;
    max-width: 800px;
  }

  .label-group > h6,
  .label-group > h5 {
    margin: unset;
    letter-spacing: 0;
  }

  .label-group ppp-select,
  .label-group ppp-text-field,
  .label-group ppp-query-select {
    max-width: 320px;
  }

  .label-group ppp-banner {
    margin-right: 20px;
  }

  .label-group > p {
    margin-top: 10px;
    padding-bottom: ${spacing1};
    padding-right: 20px;
  }

  :host([slot='body']) section {
    padding: 24px 0;
    margin: 0 36px;
  }

  :host([slot='body']) footer {
    padding: 24px 36px 36px;
  }

  :host section:last-of-type {
    border-bottom: none;
    padding-bottom: unset;
  }

  .settings-grid ppp-palette-item {
    width: 140px;
  }

  .settings-grid {
    display: flex;
    flex-direction: column;
    gap: ${spacing4} 0;
  }

  .settings-grid .row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: ${spacing2} ${spacing3};
  }

  .global-search-input {
    display: flex;
    margin: 5px 0 10px 0;
    width: 300px;
  }

  .card-container {
    margin: 15px 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, 370px);
    grid-gap: 24px;
  }

  .control-line {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .control-line.flex-start {
    align-items: flex-start;
  }

  .control-line.centered {
    align-items: center;
  }

  .control-line.space-between {
    justify-content: space-between;
  }

  .control-line ppp-checkbox + ppp-query-select {
    flex: 1 0 0;
  }

  .control-stack {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 8px;
  }

  .icon {
    width: 16px;
    height: 16px;
  }

  .implementation-area {
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 0 20px;
  }

  .implementation-area .label-group:not(:first-child) {
    margin-top: 25px;
  }

  .implementation-area ppp-banner {
    width: 100%;
  }

  .implementation-area ppp-banner .label-group {
    padding-bottom: 8px;
  }
`;

class ScratchMap extends Map {
  #observable;

  constructor(observable) {
    super();

    this.#observable = observable;
  }

  set(key, value) {
    super.set(key, value);

    Observable.notify(this.#observable, 'scratch');
  }
}

class Page extends PPPElement {
  /**
   * The scratchpad is available within the context of a page to store
   * temporary data or computations.
   */
  @observable
  scratch;

  @observable
  document;

  @observable
  documents;

  @attr
  status;

  #keypressHandler(e) {
    switch (e.code) {
      case 'Enter':
        const cp = e.composedPath();

        if (cp.find((el) => el?.tagName?.toLowerCase() === 'textarea')) return;

        // Prevent parent submissions
        if (cp.indexOf(this) > -1) {
          if (this.form instanceof HTMLFormElement) {
            this.form.querySelector('[type=submit]')?.click();

            e.preventDefault();
            e.stopPropagation();
          }
        }

        break;
    }
  }

  constructor() {
    super();

    this.status = PAGE_STATUS.NOT_READY;
    this.scratch = new ScratchMap(this);
    this.document = {};
    this.documents = [];
  }

  async connectedCallback() {
    super.connectedCallback();

    this.form = this.shadowRoot.querySelector('form[novalidate]');

    if (this.form) {
      this.addEventListener('keypress', this.#keypressHandler);

      this.form.insertAdjacentHTML(
        'afterbegin',
        '<input type="submit" hidden>'
      );

      this.form.onsubmit = (e) => {
        if (this.canSubmit(e)) {
          void this.submitDocument();
        }

        return false;
      };
    }

    if (!this.hasAttribute('disable-auto-read')) {
      await this.readDocument();

      if (typeof this.populate === 'function') {
        if (!this.lastError) {
          if (!this.hasAttribute('disable-auto-populate'))
            return this.populateDocuments();
        }
      } else {
        this.documents = [];
      }
    } else {
      this.status = PAGE_STATUS.READY;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener('keypress', this.#keypressHandler);
  }

  isSteady() {
    return !(
      this.status === PAGE_STATUS.NOT_READY ||
      this.status === PAGE_STATUS.OPERATION_STARTED
    );
  }

  generateClasses() {
    const result = ['page'];

    if (
      this.status === PAGE_STATUS.NOT_READY ||
      this.status === PAGE_STATUS.OPERATION_STARTED
    )
      result.push('loader-visible');

    return result.join(' ');
  }

  async notFound() {
    this.style.display = 'none';
    ppp.app.pageNotFound = true;
  }

  async documentId() {
    return (
      this.getAttribute('document-id') ??
      (await this.getDocumentId?.()) ??
      ppp.app.params()?.document
    );
  }

  async readDocument(options = {}) {
    const documentId = await this.documentId();

    if (documentId) {
      this.beginOperation();

      try {
        if (typeof this.read === 'function') {
          let readMethodResult = await this.read(documentId);

          if (typeof readMethodResult === 'function') {
            readMethodResult = await new Tmpl().render(
              this,
              readMethodResult.toString(),
              { documentId }
            );
          }

          let document;

          if (typeof readMethodResult === 'string') {
            const code = readMethodResult.split(/\r?\n/);

            code.pop();
            code.shift();

            document = await ppp.user.functions.eval(code.join('\n'));

            // [] for empty aggregations
            if (!document || (Array.isArray(document) && !document.length)) {
              // noinspection ExceptionCaughtLocallyJS
              throw new DocumentNotFoundError({ documentId });
            }

            if (Array.isArray(document) && document.length === 1)
              document = document[0];

            this.document = await ppp.decrypt(document);
          } else {
            this.document = readMethodResult ?? {};
          }
        } else if (this.collection) {
          this.document = await ppp.decrypt(
            await ppp.user.functions.findOne(
              { collection: this.collection },
              {
                _id: documentId
              }
            )
          );

          if (!this.document) {
            this.document = {};

            // noinspection ExceptionCaughtLocallyJS
            throw new DocumentNotFoundError({ documentId });
          }
        } else {
          this.document = {};
        }

        if (typeof this.transform === 'function') {
          this.document = await this.transform(documentId);
        }

        this.status = PAGE_STATUS.READY;
      } catch (e) {
        this.document = {};

        if (options.raiseException) throw e;

        this.failOperation(e);
      } finally {
        this.endOperation();
      }
    } else {
      this.status = PAGE_STATUS.READY;
    }
  }

  async populateDocuments(anyData) {
    this.beginOperation();

    try {
      if (typeof this.populate === 'function') {
        let populateMethodResult = await this.populate(anyData);

        if (typeof populateMethodResult === 'function') {
          populateMethodResult = await new Tmpl().render(
            this,
            populateMethodResult.toString(),
            {}
          );
        }

        if (typeof populateMethodResult === 'string') {
          const code = populateMethodResult.split(/\r?\n/);

          code.pop();
          code.shift();

          this.documents = await ppp.user.functions.eval(code.join('\n'));
        } else {
          this.documents = populateMethodResult ?? [];
        }
      } else {
        this.documents = [];
      }

      if (typeof this.transformMany === 'function') {
        this.documents = await this.transformMany();
      }

      this.status = PAGE_STATUS.READY;
    } catch (e) {
      this.documents = [];

      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async cleanupAndRemoveDocument() {
    if (
      await ppp.app.confirm(
        'Удаление документа',
        `Подтвердите, что собираетесь удалить документ «${
          this.document.name ?? this.document.title ?? this.document._id
        }».`
      )
    ) {
      this.beginOperation();

      try {
        await this.cleanup?.();
        await this.updateDocumentFragment({
          $set: {
            removed: true,
            updatedAt: new Date()
          }
        });

        this.showSuccessNotification('Документ удалён.', 'Удаление документа');
      } catch (e) {
        await this.updateDocumentFragment({
          $set: {
            removed: true,
            updatedAt: new Date()
          }
        });

        this.failOperation(e, 'Удаление документа');
      } finally {
        this.endOperation();
      }

      return true;
    }

    return false;
  }

  async cleanupFromListing({ pageName, documentId }) {
    const page = await ppp.app.mountPage(pageName, {
      documentId,
      stayHidden: true
    });

    await page.readDocument();

    try {
      if (await page.cleanupAndRemoveDocument()) {
        this.beginOperation();

        const index = this.documents.findIndex((d) => d._id === documentId);

        if (index > -1) {
          this.documents.splice(index, 1);
        }

        Observable.notify(this, 'documents');
      } else {
        return false;
      }

      return true;
    } finally {
      this.endOperation();

      page.remove();
    }
  }

  getToastTitle() {
    let toastTitle = 'PPP';

    const visibleModal = ppp.app.getVisibleModal();

    if (visibleModal) {
      toastTitle = visibleModal
        .querySelector('[slot="title"]')
        ?.textContent?.trim();
    } else {
      const headerText = ppp.app.shadowRoot
        .querySelector('.page')
        ?.shadowRoot?.querySelector('ppp-page-header')
        ?.shadowRoot?.querySelector('.title')
        ?.firstElementChild?.assignedNodes?.();

      if (Array.isArray(headerText)) {
        toastTitle = headerText
          .filter((h) => h.textContent.trim())
          .map((text) => text.textContent)
          .join(' ');
      }
    }

    return toastTitle;
  }

  beginOperation() {
    if (!ppp.app) return;

    this.lastError = void 0;

    // Do not hide update notifications
    if (
      ppp.app.toast.appearance !== 'note' &&
      ppp.app.toast.appearance !== 'progress'
    ) {
      ppp.app.toast.setAttribute('hidden', '');
    }

    this.status = PAGE_STATUS.OPERATION_STARTED;
  }

  progressOperation(progress = 0, toastText) {
    if (!ppp.app) return;

    ppp.app.toast.appearance = 'progress';

    Updates.enqueue(() => (ppp.app.toast.progress.value = progress));
    ppp.app.toast.dismissible = false;

    if (toastText) {
      ppp.app.toast.text = toastText;
    }

    ppp.app.toast.removeAttribute('hidden');

    this.status = PAGE_STATUS.OPERATION_STARTED;
  }

  endOperation() {
    this.status = PAGE_STATUS.OPERATION_ENDED;
  }

  showSuccessNotification(
    toastText = ppp.t('$operations.operationSucceeded'),
    toastTitle = this.getToastTitle()
  ) {
    if (!toastText.endsWith('.')) toastText += '.';

    ppp.app.toast.appearance = 'success';
    ppp.app.toast.dismissible = true;
    ppp.app.toast.title = toastTitle;
    ppp.app.toast.text = toastText;

    ppp.app.toast.removeAttribute('hidden');
  }

  failOperation(e, toastTitle = this.getToastTitle()) {
    console.error(e);

    this.lastError = e;
    this.status = PAGE_STATUS.OPERATION_FAILED;

    const errorName = e?.errorCode ?? e?.error_code ?? e?.name;

    ppp.app.toast.title = toastTitle;

    if (
      [
        'EndpointDuplicateKey',
        'FunctionDuplicateName',
        'InvalidParameter',
        'FunctionExecutionError',
        'OperationError',
        'MongoDBError',
        'InvalidCharacterError',
        'SyntaxError',
        'TypeError',
        'ReferenceError'
      ].indexOf(errorName) > -1
    ) {
      return invalidate(ppp.app.toast, {
        errorMessage: ppp.t(`$exceptions.${errorName}`, {
          _: ppp.t('$pppErrors.E_UNKNOWN')
        })
      });
    }

    switch (errorName) {
      case 'ValidationError':
        return invalidate(ppp.app.toast, {
          errorMessage: e?.message ?? ppp.t('$pppErrors.E_BAD_FORM')
        });
      case 'FetchError':
        return invalidate(ppp.app.toast, {
          errorMessage:
            e?.pppMessage ??
            (e?.message || void 0) ??
            ppp.t('$pppErrors.E_FETCH_FAILED')
        });
      case 'DocumentNotFoundError':
        if (typeof this.notFound === 'function') this.notFound();

        return invalidate(ppp.app.toast, {
          errorMessage:
            (e?.message || void 0) ?? ppp.t('$pppErrors.E_DOCUMENT_NOT_FOUND')
        });
      case 'ConflictError':
        return invalidate(ppp.app.toast, {
          errorMessage: e?.href
            ? html`Документ с таким названием уже существует, перейдите по
                <a href="${e.href}">ссылке</a> для редактирования.`
            : e?.message ?? ppp.t('$pppErrors.E_DOCUMENT_CONFLICT')
        });
      default:
        invalidate(ppp.app.toast, {
          errorMessage:
            e?.pppMessage ??
            (e?.message || void 0) ??
            ppp.t('$operations.operationFailedDetailsInConsole')
        });
    }
  }

  async updateDocumentFragment(documentUpdateFragment = {}) {
    const document = this.document;
    const ownId = await this.getDocumentId?.();

    if (document._id ?? ownId) {
      const encryptedUpdateClause = Object.assign({}, documentUpdateFragment);

      if (encryptedUpdateClause.$set) {
        encryptedUpdateClause.$set = await ppp.encrypt(
          encryptedUpdateClause.$set
        );
      }

      await ppp.user.functions.updateOne(
        {
          collection: this.collection
        },
        document._id
          ? {
              _id: document._id
            }
          : ownId,
        encryptedUpdateClause,
        {
          upsert: true
        }
      );

      this.document = Object.assign(
        {},
        this.document,
        documentUpdateFragment.$set ?? {}
      );
    }
  }

  async #applyDocumentUpdates(idClause, fragments = []) {
    for (let documentUpdateFragment of fragments) {
      const isAnonymousFunc =
        typeof documentUpdateFragment === 'function' &&
        !documentUpdateFragment.name;

      if (typeof documentUpdateFragment === 'object' || isAnonymousFunc) {
        if (isAnonymousFunc)
          documentUpdateFragment = documentUpdateFragment.call(this);

        const encryptedUpdateClause = Object.assign({}, documentUpdateFragment);

        if (encryptedUpdateClause.$set) {
          encryptedUpdateClause.$set = await ppp.encrypt(
            encryptedUpdateClause.$set
          );
        }

        if (encryptedUpdateClause.$setOnInsert) {
          encryptedUpdateClause.$setOnInsert = await ppp.encrypt(
            encryptedUpdateClause.$setOnInsert
          );
        }

        if (typeof encryptedUpdateClause?.$set?.removed === 'undefined') {
          if (typeof encryptedUpdateClause.$unset === 'undefined') {
            encryptedUpdateClause.$unset = { removed: '' };
          } else if (
            typeof encryptedUpdateClause.$unset?.removed === 'undefined'
          ) {
            encryptedUpdateClause.$unset.removed = '';
          }
        }

        await ppp.user.functions.updateOne(
          {
            collection: this.collection
          },
          idClause,
          encryptedUpdateClause,
          {
            upsert: true
          }
        );

        this.document = Object.assign(
          {},
          this.document,
          { removed: void 0 },
          documentUpdateFragment.$set ?? {}
        );
      } else if (
        typeof documentUpdateFragment === 'function' &&
        documentUpdateFragment.name
      ) {
        await documentUpdateFragment.call(this);
      }
    }
  }

  async #submitDocument(idClause) {
    if (typeof this.submit === 'function') {
      let documentUpdateFragments = await this.submit();

      // For debugging, skip immediately
      if (documentUpdateFragments === false) {
        return this.endOperation();
      }

      if (!Array.isArray(documentUpdateFragments)) {
        documentUpdateFragments = [documentUpdateFragments];
      }

      if (idClause) {
        await this.#applyDocumentUpdates(idClause, documentUpdateFragments);
      } else {
        // No _id here, insert first via upsert
        const fragments = [...documentUpdateFragments];
        const firstFragment = fragments.shift();
        const upsertClause = Object.assign({}, firstFragment);
        const encryptedUpsertClause = Object.assign({}, upsertClause);

        if (encryptedUpsertClause.$set) {
          encryptedUpsertClause.$set = await ppp.encrypt(
            encryptedUpsertClause.$set
          );
        }

        if (encryptedUpsertClause.$setOnInsert) {
          encryptedUpsertClause.$setOnInsert = await ppp.encrypt(
            encryptedUpsertClause.$setOnInsert
          );
        }

        const { upsertedId } = await ppp.user.functions.updateOne(
          {
            collection: this.collection
          },
          (await this.find?.()) ?? { uuid: uuidv4() },
          encryptedUpsertClause,
          {
            upsert: true
          }
        );

        this.document = Object.assign(
          { _id: upsertedId },
          this.document,
          upsertClause.$setOnInsert ?? {},
          upsertClause.$set ?? {}
        );

        ppp.app.setURLSearchParams({
          document: upsertedId
        });

        return this.#applyDocumentUpdates({ _id: upsertedId }, fragments);
      }
    }
  }

  canSubmit() {
    return true;
  }

  async submitDocument(options = {}) {
    this.beginOperation();

    try {
      const document = this.document;

      if (typeof this.validate === 'function') await this.validate();

      const ownId = await this.getDocumentId?.();

      if (document._id ?? ownId) {
        // Update existing document
        await this.#submitDocument(
          document._id
            ? {
                _id: document._id
              }
            : ownId
        );
      } else {
        // Look for existing document, then insert
        if (typeof this.find === 'function') {
          const existingDocument = await ppp.user.functions.findOne(
            {
              collection: this.collection
            },
            await this.find(),
            {
              _id: 1
            }
          );

          if (existingDocument) {
            // noinspection ExceptionCaughtLocallyJS
            throw new ConflictError({
              href: `?page=${
                this.getAttribute('href') ?? ppp.app.params().page
              }&document=${existingDocument._id}`
            });
          }
        }

        await this.#submitDocument();
      }

      if (!options.silent) this.showSuccessNotification();
    } catch (e) {
      if (options.raiseException) throw e;

      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}

/**
 * @mixin
 */
class PageWithService {
  @observable
  actualVersion;

  statusChanged(oldValue, newValue) {
    if (newValue === PAGE_STATUS.READY) {
      return this.checkVersion();
    }
  }

  getVersioningStatus() {
    return this.document.useVersioning
      ? this.document.version < this.actualVersion
        ? VERSIONING_STATUS.OLD
        : VERSIONING_STATUS.OK
      : VERSIONING_STATUS.OFF;
  }

  getVersionFromSnippet(snippet, validateVersion) {
    let version = 1;
    const parsed = parsePPPScript(snippet.value);

    if (parsed) {
      [version] = parsed?.meta?.version;
      version = Math.abs(+version) || 1;
    }

    if (validateVersion) {
      if (!parsed || typeof version !== 'number') {
        invalidate(snippet, {
          errorMessage: 'Не удалось прочитать версию',
          raiseException: true
        });
      }
    }

    if (typeof version !== 'number') {
      version = 1;
    }

    return version;
  }

  async checkVersion() {
    try {
      if (this.document.useVersioning) {
        const versioningUrl = this.document.versioningUrl.trim();

        if (versioningUrl) {
          const fcRequest = await fetch(
            ppp.getWorkerTemplateFullUrl(versioningUrl).toString(),
            {
              cache: 'reload'
            }
          );

          await maybeFetchError(
            fcRequest,
            'Не удалось отследить версию сервиса.'
          );

          const parsed = parsePPPScript(await fcRequest.text());

          if (!parsed || !Array.isArray(parsed.meta?.version)) {
            invalidate(this.versioningUrl, {
              errorMessage: 'Не удалось прочитать версию',
              raiseException: true
            });
          }

          const [version] = parsed.meta?.version;

          this.actualVersion = Math.abs(parseInt(version) || 1);

          if (typeof this.actualVersion !== 'number') this.actualVersion = 1;
        } else {
          this.actualVersion = 1;
        }
      } else {
        this.actualVersion = 1;
      }
    } catch (e) {
      console.error(e?.pppMessage);

      this.actualVersion = 1;
    }
  }

  async updateService() {
    this.beginOperation();

    try {
      await this.update?.();
      await this.submitDocument();
    } finally {
      this.endOperation();
    }
  }

  async restartService() {
    this.beginOperation();

    try {
      await this.restart?.();
      await this.updateDocumentFragment({
        $set: {
          state: SERVICE_STATE.ACTIVE,
          updatedAt: new Date()
        }
      });

      this.showSuccessNotification('Сервис перезапущен.', 'Перезапуск сервиса');
    } catch (e) {
      await this.updateDocumentFragment({
        $set: {
          state: SERVICE_STATE.FAILED,
          updatedAt: new Date()
        }
      });

      this.failOperation(e, 'Перезапуск сервиса');
    } finally {
      this.endOperation();
    }
  }

  async stopService() {
    this.beginOperation();

    try {
      await this.stop?.();
      await this.updateDocumentFragment({
        $set: {
          state: SERVICE_STATE.STOPPED,
          updatedAt: new Date()
        }
      });

      this.showSuccessNotification('Сервис остановлен.', 'Остановка сервиса');
    } catch (e) {
      await this.updateDocumentFragment({
        $set: {
          state: SERVICE_STATE.FAILED,
          updatedAt: new Date()
        }
      });

      this.failOperation(e, 'Остановка сервиса');
    } finally {
      this.endOperation();
    }
  }

  async cleanup() {
    await this.updateDocumentFragment({
      $set: {
        state: SERVICE_STATE.STOPPED,
        updatedAt: new Date()
      }
    });
  }
}

/**
 * @mixin
 */
class PageWithSupabaseService {
  async callTemporaryFunction({ api, functionBody, returnResult, extraSQL }) {
    const funcName = `pg_temp.ppp_${uuidv4().replaceAll('-', '_')}`;
    // Temporary function, no need to drop
    const query = `
      ${extraSQL ? extraSQL : ''}

      create or replace function ${funcName}()
      returns json as
      $$
        ${await new Tmpl().render(this, functionBody, {})}
      $$ language plv8;

      select ${funcName}();
    `;

    const rExecuteSQL = await fetch(
      new URL('pg', ppp.keyVault.getKey('service-machine-url')).toString(),
      {
        cache: 'reload',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          connectionString: this.getConnectionString(api)
        })
      }
    );

    await maybeFetchError(rExecuteSQL, 'Не удалось выполнить функцию.');

    const json = await rExecuteSQL.json();
    let result;

    try {
      result = JSON.parse(
        json.results.find((r) => r.command.toUpperCase() === 'SELECT').rows[0]
      );
    } catch (e) {
      // For [null]
      result = json.results.find((r) => r.command.toUpperCase() === 'SELECT');
    }

    if (returnResult) {
      return result;
    } else console.log(result);
  }

  getSQLUrl(file) {
    const origin = window.location.origin;
    let scriptUrl = new URL(`sql/${file}`, origin).toString();

    if (origin.endsWith('github.io'))
      scriptUrl = new URL(`ppp/sql/${file}`, origin).toString();

    return scriptUrl;
  }

  getConnectionString(api) {
    const { hostname } = new URL(api.url);

    return `postgres://${api.user}:${encodeURIComponent(
      api.password
    )}@db.${hostname}:${api.port}/${api.db}`;
  }

  async executeSQL({ api, query }) {
    ppp.app.terminalModal.dismissible = false;
    ppp.app.terminalModal.removeAttribute('hidden');

    const terminal = ppp.app.terminalWindow.terminal;

    try {
      terminal.clear();
      terminal.reset();
      terminal.writeInfo('Выполняется запрос к базе данных...\r\n');

      const rSQL = await fetch(
        new URL('pg', ppp.keyVault.getKey('service-machine-url')).toString(),
        {
          cache: 'no-cache',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query,
            connectionString: this.getConnectionString(api)
          })
        }
      );

      const text = await rSQL.text();

      if (!rSQL.ok) {
        console.error(text);
        terminal.writeError(text);

        // noinspection ExceptionCaughtLocallyJS
        throw new FetchError({
          ...rSQL,
          ...{ message: 'SQL-запрос завершился с ошибкой.' }
        });
      } else {
        terminal.writeln(text);
        terminal.writeln(
          '\x1b[32m\r\nОперация выполнена, это окно можно закрыть.\r\n\x1b[0m'
        );
      }
    } finally {
      ppp.app.terminalModal.dismissible = true;
    }
  }

  async action(action) {
    const query = await new Tmpl().render(
      this,
      await (
        await fetch(this.getSQLUrl(`${this.document.type}/${action}.sql`), {
          cache: 'reload'
        })
      ).text(),
      {}
    );

    return this.executeSQL({
      api: this.document.supabaseApi,
      query
    });
  }

  async restart() {
    await this.action('start');
  }

  async stop() {
    await this.action('stop');
  }

  async cleanup() {
    await this.action('cleanup');
  }
}

/**
 * @mixin
 */
class PageWithSSHTerminal {
  async processChunkedResponse(response, terminal) {
    this.terminalOutput = '';

    return this.readChunk(
      response.body.getReader(),
      new TextDecoder(),
      terminal
    );
  }

  async readChunk(reader, decoder, terminal) {
    const result = await reader.read();
    const chunk = decoder.decode(result.value || new Uint8Array(), {
      stream: !result.done
    });

    if (chunk.length) {
      const string = chunk.toString();

      this.terminalOutput += string;

      if (terminal) {
        // Error message
        if (string.startsWith('{"e"')) {
          try {
            terminal.write(
              '\x1b[31m' + JSON.parse(string).e.message + '\x1b[0m\r\n'
            );
          } catch (e) {
            terminal.write(string);
          }
        } else terminal.write(string);
      }
    }

    if (!result.done) {
      return this.readChunk(reader, decoder, terminal);
    }
  }

  async executeSSHCommandsSilently({ server = {}, commands }) {
    try {
      commands += `echo '\x1b[32m\r\nppp-ssh-ok\r\n\x1b[0m'`;

      // Only for development
      if (location.origin.endsWith('.github.io.dev')) {
        commands = commands.replaceAll(
          'salt-call --local',
          'salt-call --local -c /srv/salt'
        );
      }

      server.cmd = commands;

      if (server.authType === SERVER_TYPES.PASSWORD) {
        server.key = void 0;
        server.privateKey = void 0;
      } else if (server.authType === SERVER_TYPES.KEY) {
        server.password = void 0;
        server.privateKey = server.key;
      }

      const rSSH = await fetch(
        new URL('ssh', ppp.keyVault.getKey('service-machine-url')).toString(),
        {
          method: 'POST',
          body: JSON.stringify(server)
        }
      );

      await this.processChunkedResponse(rSSH);

      if (!rSSH.ok) {
        console.dir(rSSH);

        // noinspection ExceptionCaughtLocallyJS
        throw new FetchError(rSSH);
      }

      return /ppp-ssh-ok/i.test(this.terminalOutput);
    } catch (e) {
      console.error(e);
    }
  }

  async executeSSHCommands({ server = {}, commands, commandsToDisplay }) {
    this.terminalOutput = '';

    ppp.app.terminalModal.dismissible = false;
    ppp.app.terminalModal.removeAttribute('hidden');

    const terminal = ppp.app.terminalWindow.terminal;

    try {
      terminal.clear();
      terminal.reset();
      terminal.writeInfo('Выполняется настройка сервера...\r\n');

      if (!commandsToDisplay) commandsToDisplay = commands;

      terminal.writeInfo(commandsToDisplay);
      terminal.writeln('');

      commands += `echo '\x1b[32m\r\nppp-ssh-ok\r\n\x1b[0m'`;

      // Only for development
      if (location.origin.endsWith('.github.io.dev')) {
        commands = commands.replaceAll(
          'salt-call --local',
          'salt-call --local -c /srv/salt'
        );
      }

      server.cmd = commands;

      if (server.authType === SERVER_TYPES.PASSWORD) {
        server.key = void 0;
        server.privateKey = void 0;
      } else if (server.authType === SERVER_TYPES.KEY) {
        server.password = void 0;
        server.privateKey = server.key;
      }

      const rSSH = await fetch(
        new URL('ssh', ppp.keyVault.getKey('service-machine-url')).toString(),
        {
          method: 'POST',
          body: JSON.stringify(server)
        }
      );

      await this.processChunkedResponse(rSSH, terminal);

      if (!rSSH.ok) {
        console.dir(rSSH);

        // noinspection ExceptionCaughtLocallyJS
        throw new FetchError(rSSH);
      }

      return /ppp-ssh-ok/i.test(this.terminalOutput);
    } catch (e) {
      console.error(e);

      terminal.writeError(`Операция завершилась с ошибкой ${e.status ?? 503}`);
    } finally {
      ppp.app.terminalModal.dismissible = true;
    }
  }
}

export { Page, PageWithService, PageWithSupabaseService, PageWithSSHTerminal };
