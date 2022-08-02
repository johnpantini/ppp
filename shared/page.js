/** @decorator */

import { FoundationElement } from './foundation-element.js';
import { Observable, observable } from './element/observation/observable.js';
import { invalidate } from './validate.js';
import { html, requireComponent } from './template.js';
import { ConflictError, NotFoundError } from './http-errors.js';
import { bufferToString, generateIV } from './ppp-crypto.js';
import { attr } from './element/components/attributes.js';
import { Tmpl } from './tmpl.js';
import { keyEnter } from './web-utilities/key-codes.js';
import { DOM } from './element/dom.js';
import ppp from '../ppp.js';

/**
 * A minimal base class for PPP Page.
 */
export class Page extends FoundationElement {
  @attr({ mode: 'boolean' })
  headless;

  /**
   * The current ppp-page.
   */
  @observable
  page;

  /**
   * The current loading status.
   * @type {boolean}
   */
  @observable
  loading;

  /**
   * The current toast title.
   */
  @observable
  toastTitle;

  /**
   * The current toast text.
   */
  @observable
  toastText;

  @observable
  lastError;

  // noinspection JSUnusedGlobalSymbols
  toastTitleChanged() {
    Observable.notify(ppp.app.toast, 'source');
  }

  // noinspection JSUnusedGlobalSymbols
  toastTextChanged() {
    Observable.notify(ppp.app.toast, 'source');
  }

  // TODO
  constructor() {
    super();

    this.page = {};
    this.document = {};
    this.documents = [];
  }

  t(key, options) {
    return ppp.dict.t(key, options);
  }

  beginOperation(toastTitle) {
    if (!ppp.app) return;

    this.lastError = null;

    if (!toastTitle) {
      const visibleModal =
        ppp.app.shadowRoot.querySelector('ppp-modal[visible]');

      if (visibleModal) {
        toastTitle = visibleModal
          .querySelector('[slot="title"]')
          ?.textContent?.trim();

        // toastTitle = visibleModal.querySelector('');
      } else {
        toastTitle = ppp.app.shadowRoot
          .querySelector('.page-content')
          ?.lastElementChild?.shadowRoot?.querySelector('[slot="header"]')
          ?.textContent?.trim();
      }
    }

    this.page.loading = true;

    Observable.notify(this, 'page');

    this.toastTitle = toastTitle;
    this.toastText = 'Операция выполняется';
    ppp.app.toast.visible = false;
    ppp.app.toast.source = this;
  }

  failOperation(e) {
    console.dir(e);

    this.lastError = e;

    switch (e?.errorCode ?? e?.name) {
      case 'InvalidParameter':
        return invalidate(ppp.app.toast, {
          errorMessage: 'Неверный параметр облачной функции MongoDB Realm.'
        });
      case 'FunctionExecutionError':
        return invalidate(ppp.app.toast, {
          errorMessage: 'Ошибка выполнения облачной функции MongoDB Realm.'
        });
      case 'OperationError':
        return invalidate(ppp.app.toast, {
          errorMessage:
            'Не удалось дешифровать данные. Проверьте мастер-пароль.'
        });
      case 'MongoDBError':
        return invalidate(ppp.app.toast, {
          errorMessage: 'Ошибка MongoDB Realm. Подробности в консоли браузера.'
        });
      case 'InvalidCharacterError':
        return invalidate(ppp.app.toast, {
          errorMessage: 'Данные для декодирования содержат ошибки.'
        });

      case 'ValidationError':
        return invalidate(ppp.app.toast, {
          errorMessage:
            e?.pppMessage ??
            e?.message ??
            'Форма заполнена некорректно или не полностью.'
        });
      case 'FetchError':
        return invalidate(ppp.app.toast, {
          errorMessage: e?.pppMessage ?? e?.message ?? 'Ошибка загрузки.'
        });
      case 'NotFoundError':
        this.page.notFound();

        return invalidate(ppp.app.toast, {
          errorMessage: e?.message ?? 'Запись с таким ID не существует.'
        });
      case 'ConflictError':
        return invalidate(ppp.app.toast, {
          errorMessage:
            e?.message ??
            html`Запись с таким названием уже существует, перейдите по
              <a href="${e.href}">ссылке</a> для редактирования.`
        });
      case 'SyntaxError':
        return invalidate(ppp.app.toast, {
          errorMessage: 'Синтаксическая ошибка в коде или данных.'
        });
      case 'TypeError':
        return invalidate(ppp.app.toast, {
          errorMessage:
            'Значение имеет не ожидаемый тип. Свяжитесь с разработчиками.'
        });
      case 'ReferenceError':
        return invalidate(ppp.app.toast, {
          errorMessage:
            'Обращение к несуществующей переменной. Свяжитесь с разработчиками.'
        });
      default:
        invalidate(ppp.app.toast, {
          errorMessage:
            e?.pppMessage ??
            e?.message ??
            'Операция не выполнена, подробности в консоли браузера.'
        });
    }
  }

  progressOperation(progress = 0, toastText = this.toastText) {
    if (!ppp.app) return;

    ppp.app.toast.appearance = 'progress';
    this.toastText = toastText;
    DOM.queueUpdate(() => (ppp.app.toast.progress.value = progress));
    ppp.app.toast.dismissible = false;
    ppp.app.toast.visible = true;
  }

  succeedOperation(toastText = 'Операция успешно выполнена.') {
    ppp.app.toast.appearance = 'success';
    ppp.app.toast.dismissible = true;
    this.toastText = toastText;
    ppp.app.toast.visible = true;
  }

  endOperation() {
    this.page.loading = false;

    Observable.notify(this, 'page');
  }

  async encrypt(document) {
    return ppp.encrypt(document, this.page.view.excludeFromEncryption);
  }

  async decrypt(document) {
    return ppp.decrypt(document, this.page.view.excludeFromEncryption);
  }

  async notFound() {
    await requireComponent('ppp-not-found-page');

    this.style.display = 'none';
    ppp.app.pageNotFound = true;
  }

  async #applyDocumentUpdates(idClause, results = []) {
    for (const documentUpdateFragment of results) {
      if (typeof documentUpdateFragment === 'object') {
        const encryptedUpdateClause = Object.assign({}, documentUpdateFragment);

        if (encryptedUpdateClause.$set) {
          encryptedUpdateClause.$set = await this.encrypt(
            encryptedUpdateClause.$set
          );
        }

        if (encryptedUpdateClause.$setOnInsert) {
          encryptedUpdateClause.$setOnInsert = await this.encrypt(
            encryptedUpdateClause.$setOnInsert
          );
        }

        await ppp.user.functions.updateOne(
          {
            collection: this.page.view.collection
          },
          idClause,
          encryptedUpdateClause,
          {
            upsert: true
          }
        );

        this.page.view.document = Object.assign(
          {},
          this.page.view.document,
          documentUpdateFragment.$set ?? {}
        );
      } else if (typeof documentUpdateFragment === 'function') {
        await documentUpdateFragment.call(this.page.view);
      }

      Observable.notify(this, 'page');
    }
  }

  async #updateDocument(idClause) {
    if (typeof this.page.view.update === 'function') {
      let documentUpdateFragments = await this.page.view.update();

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
        // No _id here, insert first
        const fragments = [...documentUpdateFragments];
        const firstFragment = fragments.shift();
        const insertClause = Object.assign(
          {},
          firstFragment.$setOnInsert ?? {},
          firstFragment.$set ?? {}
        );
        const encryptedInsertClause = await this.encrypt(
          Object.assign({}, insertClause)
        );
        const { insertedId } = await ppp.user.functions.insertOne(
          {
            collection: this.page.view.collection
          },
          encryptedInsertClause
        );

        this.page.view.document = Object.assign(
          { _id: insertedId },
          this.page.view.document,
          insertClause
        );

        Observable.notify(this, 'page');

        ppp.app.setURLSearchParams({
          document: insertedId
        });

        await this.#applyDocumentUpdates({ _id: insertedId }, fragments);
      }
    }
  }

  async saveDocument() {
    if (typeof this.page.view.save === 'function') return this.page.view.save();

    this.beginOperation();

    try {
      const document = this.page.view.document;

      if (typeof this.page.view.validate === 'function')
        await this.page.view.validate();

      const ownId = await this.page.view.getDocumentId?.();

      if (document._id ?? ownId) {
        // Update existing document
        await this.#updateDocument(
          document._id
            ? {
                _id: document._id
              }
            : ownId
        );
      } else {
        // Look for existing document, then insert
        if (typeof this.page.view.find === 'function') {
          const existingDocument = await ppp.user.functions.findOne(
            {
              collection: this.page.view.collection
            },
            await this.page.view.find(),
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

        await this.#updateDocument();
      }

      this.succeedOperation();
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  #keypressHandler(e) {
    switch (e.key) {
      case keyEnter:
        // Prevent multiple submissions
        const parentPage = e.path.find(
          (e) => e.$pppController?.definition?.type?.name === 'Page'
        );

        if (parentPage && this.form.page === parentPage)
          if (this.form instanceof HTMLFormElement) {
            // Implicit submission
            this.form.querySelector('[type=submit]')?.click();
          }

        break;
    }
  }

  async connectedCallback() {
    super.connectedCallback();

    const pppPage = this.shadowRoot.querySelector('ppp-page');

    if (pppPage) {
      // This instance is a subclass view.
      this.page = pppPage;
      this.page.view = this.page.view ?? this;

      Observable.notify(this, 'page');

      // Skip for modals
      if (ppp.app) {
        ppp.app.pageConnected = true;
      }

      if (typeof this.readDocument === 'function') {
        await this.readDocument();
      }

      if (typeof this.populateDocuments === 'function') {
        await this.populateDocuments();
      }
    } else {
      // This instance is the ppp-page itself.
      this.page = this;

      const parentNode = this.page.parentNode;

      if (/^form$/i.test(parentNode?.tagName)) {
        this.form = parentNode;
        this.form.page = this.page;

        this.addEventListener('keypress', this.#keypressHandler, {
          passive: true
        });

        parentNode.insertAdjacentHTML(
          'afterbegin',
          '<input type="submit" hidden>'
        );

        parentNode.onsubmit = () => {
          this.saveDocument();

          return false;
        };
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener('keypress', this.#keypressHandler);
  }
}

export class PageWithDocument {
  /**
   * The current document.
   */
  @observable
  document;

  async notFound() {
    await requireComponent('ppp-not-found-page');

    this.style.display = 'none';
    ppp.app.pageNotFound = true;
  }

  async readDocument() {
    this.beginOperation();

    try {
      const documentId =
        (await this.page.view.getDocumentId?.()) ?? ppp.app.params()?.document;

      if (documentId) {
        if (typeof this.page.view.read === 'function') {
          let readMethodResult = await this.page.view.read();

          if (typeof readMethodResult === 'function') {
            readMethodResult = await new Tmpl().render(
              this.page.view,
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

            if (!document) {
              // noinspection ExceptionCaughtLocallyJS
              throw new NotFoundError({ documentId });
            }

            if (Array.isArray(document) && document.length === 1)
              document = document[0];

            this.document = await this.decrypt(document);
          } else {
            this.document = readMethodResult ?? {};
          }
        } else if (this.page.view.collection) {
          this.document = await this.decrypt(
            await ppp.user.functions.findOne(
              { collection: this.page.view.collection },
              {
                _id: documentId
              }
            )
          );

          if (!this.document) {
            this.document = {};

            // noinspection ExceptionCaughtLocallyJS
            throw new NotFoundError({ documentId });
          }
        } else {
          this.document = {};
        }
      }
    } catch (e) {
      this.document = {};

      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}

export class PageWithDocuments {
  /**
   * The current documents to list in a table.
   */
  @observable
  documents;

  async populateDocuments() {
    this.beginOperation();

    try {
      if (typeof this.page.view.populate === 'function') {
        let populateMethodResult = await this.page.view.populate();

        if (typeof populateMethodResult === 'function') {
          populateMethodResult = await new Tmpl().render(
            this.page.view,
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
      } else if (this.page.view.collection) {
        this.documents = await ppp.user.functions.aggregate(
          { collection: this.page.view.collection },
          [{ $match: { removed: { $not: { $eq: true } } } }]
        );
      } else {
        this.documents = [];
      }
    } catch (e) {
      this.documents = [];

      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}

/**
 *
 * @var {HTMLElement} shiftLockContainer
 */
export class PageWithShiftLock extends Page {
  connectedCallback() {
    super.connectedCallback();

    this.keyDownUpHandler = (event) => {
      if (event.key === 'Shift' && this.shiftLockContainer) {
        this.shiftLockContainer.shadowRoot
          .querySelectorAll('[shiftlock]')
          .forEach((element) => {
            if (event.type === 'keydown') {
              element.removeAttribute('disabled');
            } else {
              element.setAttribute('disabled', '');
            }
          });
      }
    };

    document.addEventListener('keydown', this.keyDownUpHandler, {
      passive: true
    });
    document.addEventListener('keyup', this.keyDownUpHandler, {
      passive: true
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    document.removeEventListener('keydown', this.keyDownUpHandler);
    document.removeEventListener('keyup', this.keyDownUpHandler);
  }
}
