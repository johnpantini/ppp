/** @decorator */

import ppp from '../ppp.js';
import { PPPElement } from '../lib/ppp-element.js';
import {
  html,
  css,
  observable,
  Observable,
  attr
} from '../vendor/fast-element.min.js';
import { display } from '../vendor/fast-utilities.js';
import { normalize, spacing, typography } from '../design/styles.js';
import {
  paletteGrayDark2,
  paletteGrayLight2,
  defaultTextColor,
  themeConditional,
  paletteWhite,
  paletteBlack,
  spacing1,
  spacing2
} from '../design/design-tokens.js';
import { PAGE_STATUS } from '../lib/const.js';
import { Tmpl } from '../lib/tmpl.js';
import {
  ConflictError,
  DocumentNotFoundError,
  invalidate
} from '../lib/ppp-errors.js';
import './toast.js';

await ppp.i18n(import.meta.url);

(class PageHeader extends PPPElement {}
  .compose({
    template: html`
      <h3 class="title">
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
        align-items: center;
        border-bottom: 3px solid
          ${themeConditional(paletteGrayLight2, paletteGrayDark2)};
        flex-direction: row;
        justify-content: flex-start;
        margin: 0;
        padding-bottom: 15px;
        padding-top: 0;
      }

      .title {
        color: ${defaultTextColor};
        margin-right: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
  .define());

export const pageStyles = css`
  ${normalize()}
  ${spacing()}
  ${typography()}
  :host(.page) {
    position: relative;
    height: 100%;
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
    align-items: baseline;
    justify-content: flex-end;
    flex-wrap: wrap;
    flex-grow: 1;
    max-width: 100%;
    border-bottom: none;
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
    align-self: baseline;
    max-width: 960px;
  }

  .label-group.full {
    width: 100%;
  }

  .input-group {
    flex-grow: 1;
    align-items: center;
    max-width: 960px;
  }

  .label-group > h6,
  .label-group > h5 {
    margin: unset;
    letter-spacing: 0;
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

      this.form.onsubmit = () => {
        void this.submitDocument();

        return false;
      };
    }

    if (!this.hasAttribute('disable-auto-read')) {
      return this.readDocument();
    } else {
      this.status = PAGE_STATUS.READY;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener('keypress', this.#keypressHandler);
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

  async readDocument() {
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

        if (typeof this.transformDocument === 'function') {
          this.document = await this.transformDocument(documentId);
        }

        this.status = PAGE_STATUS.READY;
      } catch (e) {
        this.document = {};

        this.failOperation(e);
      } finally {
        this.endOperation();
      }
    } else {
      this.status = PAGE_STATUS.READY;
    }
  }

  beginOperation(toastTitle) {
    if (!ppp.app) return;

    if (!toastTitle) {
      const visibleModal = ppp.app.getVisibleModal();

      if (visibleModal) {
        toastTitle = visibleModal
          .querySelector('[slot="title"]')
          ?.textContent?.trim();
      } else {
        toastTitle = ppp.app.shadowRoot
          .querySelector('.page-content')
          ?.lastElementChild?.shadowRoot?.querySelector('[slot="header"]')
          ?.textContent?.trim();
      }
    }

    ppp.app.toast.title = toastTitle;
    ppp.app.toast.text = ppp.t('$operations.operationInProgress');

    ppp.app.toast.setAttribute('hidden', '');

    this.status = PAGE_STATUS.OPERATION_STARTED;
  }

  showSuccessNotification(toastText = ppp.t('$operations.operationSucceeded')) {
    if (!toastText.endsWith('.')) toastText += '.';

    ppp.app.toast.appearance = 'success';
    ppp.app.toast.dismissible = true;
    ppp.app.toast.text = toastText;

    ppp.app.toast.removeAttribute('hidden');
  }

  endOperation() {
    this.status = PAGE_STATUS.OPERATION_ENDED;
  }

  failOperation(e) {
    console.dir(e);

    this.status = PAGE_STATUS.OPERATION_FAILED;

    const errorName = e?.errorCode ?? e?.error_code ?? e?.name;

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
          errorMessage: e?.pppMessage ?? e.message
        });
      case 'NotFoundError':
        if (typeof this.notFound === 'function') this.notFound();

        return invalidate(ppp.app.toast, {
          errorMessage: e.message
        });
      case 'ConflictError':
        return invalidate(ppp.app.toast, {
          errorMessage:
            e?.message ??
            html`Документ с таким названием уже существует, перейдите по
              <a href="${e.href}">ссылке</a> для редактирования.`
        });
      default:
        invalidate(ppp.app.toast, {
          errorMessage:
            e?.pppMessage ??
            e?.message ??
            ppp.t('$operations.operationFailedDetailsInConsole')
        });
    }
  }

  async #submitDocument(idClause) {

  }

  async submitDocument() {
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
              href: `?page=${ppp.app.params().page}&document=${
                existingDocument._id
              }`
            });
          }
        }

        await this.#submitDocument();
      }

      this.showSuccessNotification();
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}

export { Page };
