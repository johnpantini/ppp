/** @decorator */

import { FoundationElement } from './foundation-element.js';
import { Observable, observable } from './element/observation/observable.js';
import { invalidate } from './validate.js';
import { html, requireComponent } from './template.js';
import { ref } from './element/templating/ref.js';
import { ConflictError, NotFoundError } from './http-errors.js';
import { attr } from './element/components/attributes.js';
import { Tmpl } from './tmpl.js';
import { keyEnter } from './web-utilities/key-codes.js';
import { DOM } from './element/dom.js';
import { SERVICE_STATE } from './const.js';
import { uuidv4 } from './ppp-crypto.js';
import { FetchError, maybeFetchError } from './fetch-error.js';
import ppp from '../ppp.js';

/**
 * A minimal base class for PPP Page.
 */
export class Page extends FoundationElement {
  /**
   * The scratchpad is available within the context of a page to store
   * temporary data or computations.
   */
  @observable
  scratch;

  /**
   * The current document.
   */
  @observable
  document;

  /**
   * Disabled pages do not allow form submission.
   */
  @attr({ mode: 'boolean' })
  disabled;

  /**
   * If true, the header will be hidden from the page.
   */
  @attr({ mode: 'boolean' })
  headless;

  /**
   * The current ppp-page.
   */
  @observable
  page;

  /**
   * If true, the loading of the page has been completed.
   */
  @observable
  ready;

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

  constructor() {
    super();

    this.scratch = {};
    this.document = {};
    this.page = {};
  }

  scratchSet(key, value) {
    this.scratch[key] = value;

    Observable.notify(this, 'scratch');
  }

  t(key, options) {
    return ppp.dict.t(key, options);
  }

  beginOperation(toastTitle) {
    if (!ppp.app) return;

    this.lastError = null;

    if (!toastTitle) {
      const visibleModal = ppp.app.getVisibleModal();

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

    switch (e?.errorCode ?? e?.error_code ?? e?.name) {
      case 'EndpointDuplicateKey':
        return invalidate(ppp.app.toast, {
          errorMessage:
            'Конечная точка с таким методом и маршрутом уже существует.'
        });
      case 'FunctionDuplicateName':
        return invalidate(ppp.app.toast, {
          errorMessage: 'Функция с таким именем уже существует.'
        });
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
        if (typeof this.page.notFound === 'function') this.page.notFound();
        else this.notFound?.();

        return invalidate(ppp.app.toast, {
          errorMessage: e?.message ?? 'Документ с таким ID не существует.'
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

  async applyChanges(documentUpdateFragment = {}) {
    const document = this.page.view.document;
    const ownId = await this.page.view.getDocumentId?.();

    if (document._id ?? ownId) {
      const encryptedUpdateClause = Object.assign({}, documentUpdateFragment);

      if (encryptedUpdateClause.$set) {
        encryptedUpdateClause.$set = await this.encrypt(
          encryptedUpdateClause.$set
        );
      }

      await ppp.user.functions.updateOne(
        {
          collection: this.page.view.collection
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

      this.page.view.document = Object.assign(
        {},
        this.page.view.document,
        documentUpdateFragment.$set ?? {}
      );
    }
  }

  async #applyDocumentUpdates(idClause, results = []) {
    for (let documentUpdateFragment of results) {
      const isAnonymousFunc =
        typeof documentUpdateFragment === 'function' &&
        !documentUpdateFragment.name;

      if (typeof documentUpdateFragment === 'object' || isAnonymousFunc) {
        if (isAnonymousFunc)
          documentUpdateFragment = documentUpdateFragment.call(this.page.view);

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

        encryptedUpdateClause.$unset = { removed: '' };

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
          { removed: void 0 },
          documentUpdateFragment.$set ?? {}
        );
      } else if (
        typeof documentUpdateFragment === 'function' &&
        documentUpdateFragment.name
      ) {
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
        // No _id here, insert first via upsert
        const fragments = [...documentUpdateFragments];
        const firstFragment = fragments.shift();
        const upsertClause = Object.assign({}, firstFragment);
        const encryptedUpsertClause = Object.assign({}, upsertClause);

        if (encryptedUpsertClause.$set) {
          encryptedUpsertClause.$set = await this.encrypt(
            encryptedUpsertClause.$set
          );
        }

        if (encryptedUpsertClause.$setOnInsert) {
          encryptedUpsertClause.$setOnInsert = await this.encrypt(
            encryptedUpsertClause.$setOnInsert
          );
        }

        const { upsertedId } = await ppp.user.functions.updateOne(
          {
            collection: this.page.view.collection
          },
          (await this.page.view?.find?.()) ?? { uuid: uuidv4() },
          encryptedUpsertClause,
          {
            upsert: true
          }
        );

        this.page.view.document = Object.assign(
          { _id: upsertedId },
          this.page.view.document,
          upsertClause.$setOnInsert ?? {},
          upsertClause.$set ?? {}
        );

        Observable.notify(this, 'page');

        ppp.app.setURLSearchParams({
          document: upsertedId
        });

        await this.#applyDocumentUpdates({ _id: upsertedId }, fragments);
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

      if (typeof this.page.view.afterUpdate === 'function') {
        await this.page.view.afterUpdate();
      }

      this.succeedOperation();
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async documentId() {
    return (
      this.getAttribute('data-document-id') ??
      (await this.page.view.getDocumentId?.()) ??
      ppp.app.params()?.document
    );
  }

  async readDocument() {
    const documentId = await this.documentId();

    if (documentId) {
      this.beginOperation();

      try {
        if (typeof this.page.view.read === 'function') {
          let readMethodResult = await this.page.view.read(documentId);

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

            // [] for empty aggregations
            if (!document || (Array.isArray(document) && !document.length)) {
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

        if (typeof this.page.view.transform === 'function') {
          this.document = await this.page.view.transform(documentId);
        }

        this.$emit('ready');
        this.ready = true;
        Observable.notify(this.page, 'view');
      } catch (e) {
        this.document = {};

        this.failOperation(e);
      } finally {
        this.endOperation();
      }
    } else {
      this.$emit('ready');
      this.ready = true;
      Observable.notify(this.page, 'view');
    }
  }

  #keypressHandler(e) {
    switch (e.key) {
      case keyEnter:
        if (e.path.find((el) => el?.tagName?.toLowerCase() === 'textarea'))
          return;

        // Prevent multiple submissions
        const parentPage = e
          .composedPath()
          .find((e) => e.$pppController?.definition?.type?.name === 'Page');

        if (parentPage && this.form.page === parentPage)
          if (this.form instanceof HTMLFormElement) {
            // Implicit submission
            this.form.querySelector('[type=submit]')?.click();
          }

        break;
    }
  }

  connectedCallback() {
    super.connectedCallback();

    const pppPage = this.shadowRoot.querySelector('ppp-page');

    if (pppPage) {
      // This instance is a subclass view (for instance, ppp-some-page).
      this.page = pppPage;
      this.page.view = this.page.view ?? this;

      Observable.notify(this, 'page');

      // Skip for modals
      if (ppp.app) {
        ppp.app.pageConnected = true;
      }

      if (!this.hasAttribute('data-disable-auto-read'))
        void this.readDocument();
      else {
        this.$emit('ready');
        this.ready = true;
        Observable.notify(this.page, 'view');
      }
    } else {
      // This instance is the ppp-page itself.
      this.page = this;

      const parentNode = this.page.parentNode;

      // Automatic form submission via Enter.
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

/**
 * @mixin
 */
export class PageWithDocuments {
  /**
   * The current documents to list in a table.
   */
  @observable
  documents;

  ctor() {
    this.documents = [];
  }

  connectedCallback() {
    if (!this.hasAttribute('data-disable-auto-populate'))
      void this.populateDocuments();
    else {
      this.$emit('ready');
      this.ready = true;
      Observable.notify(this.page, 'view');
    }
  }

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

      this.$emit('ready');
      this.ready = true;
      Observable.notify(this.page, 'view');
    } catch (e) {
      this.documents = [];

      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async removeDocumentFromListing(datum) {
    this.beginOperation('Удаление');

    try {
      await ppp.user.functions.updateOne(
        {
          collection: this.page.view.collection
        },
        {
          _id: datum._id
        },
        {
          $set: {
            removed: true
          }
        },
        {
          upsert: true
        }
      );

      const index = this.documents.findIndex((d) => d._id === datum._id);

      if (index > -1) {
        this.documents.splice(index, 1);
      }

      Observable.notify(this, 'documents');

      this.succeedOperation();
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}

/**
 *
 * @mixin
 * @var {HTMLElement} shiftLockContainer
 */
export class PageWithShiftLock {
  ctor() {
    this.onShiftLockKeyUpDown = this.onShiftLockKeyUpDown.bind(this);
  }

  onShiftLockKeyUpDown(event) {
    if (this.shiftLockContainer && !Array.isArray(this.shiftLockContainer))
      this.shiftLockContainer = [this.shiftLockContainer];

    if (event.key === 'Shift') {
      this.shiftLockContainer?.forEach((container) => {
        container.shadowRoot
          .querySelectorAll('[shiftlock]')
          .forEach((element) => {
            if (event.type === 'keydown') {
              element.removeAttribute('disabled');
            } else {
              element.setAttribute('disabled', '');
            }
          });
      });
    }
  }

  connectedCallback() {
    document.addEventListener('keydown', this.onShiftLockKeyUpDown, {
      passive: true
    });
    document.addEventListener('keyup', this.onShiftLockKeyUpDown, {
      passive: true
    });
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.onShiftLockKeyUpDown);
    document.removeEventListener('keyup', this.onShiftLockKeyUpDown);
  }
}

/**
 * @mixin
 */
export class PageWithActionPage {
  @observable
  actionPageName;

  @observable
  actionPageDocumentId;

  async actionPageCall({ page, documentId, methodName, methodArguments = [] }) {
    this.page.loading = true;

    try {
      this.actionPageName = page;
      this.actionPageDocumentId = documentId;

      await requireComponent(`ppp-${page}-page`);
      await this.actionPage.readDocument();
      await this.actionPage[methodName].apply(this.actionPage, methodArguments);

      this.actionPageName = 'blank';
    } finally {
      this.page.loading = false;
    }
  }
}

/**
 * Allows us to invoke methods of foreign pages.
 * @type {ViewTemplate}
 */
export const actionPageMountPoint = html`
  <div class="action-page-mount-point">
    ${(x) => html`
      <ppp-${x.actionPageName ?? 'blank'}-page
        data-disable-auto-read
        data-disable-auto-populate
        data-document-id="${(x) => x.actionPageDocumentId}"
        ${ref('actionPage')}
      >
      </ppp-${x.actionPageName ?? 'blank'}-page>`}
  </div>
`;

/**
 * @mixin
 */
export class PageWithService {
  async restartService() {
    this.beginOperation('Перезапуск сервиса');

    try {
      await this.restart?.();
      await this.applyChanges({
        $set: {
          state: SERVICE_STATE.ACTIVE,
          updatedAt: new Date()
        }
      });

      this.succeedOperation();
    } catch (e) {
      await this.applyChanges({
        $set: {
          state: SERVICE_STATE.FAILED,
          updatedAt: new Date()
        }
      });

      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async stopService() {
    this.beginOperation('Остановка сервиса');

    try {
      await this.stop?.();
      await this.applyChanges({
        $set: {
          state: SERVICE_STATE.STOPPED,
          updatedAt: new Date()
        }
      });

      this.succeedOperation();
    } catch (e) {
      await this.applyChanges({
        $set: {
          state: SERVICE_STATE.FAILED,
          updatedAt: new Date()
        }
      });

      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async cleanupService() {
    this.beginOperation('Удаление сервиса');

    try {
      await this.cleanup?.();
      await this.applyChanges({
        $set: {
          state: SERVICE_STATE.STOPPED,
          removed: true,
          updatedAt: new Date()
        }
      });

      this.succeedOperation();
    } catch (e) {
      await this.applyChanges({
        $set: {
          state: SERVICE_STATE.FAILED,
          removed: true,
          updatedAt: new Date()
        }
      });

      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}

/**
 * @mixin
 */
export class PageWithSupabaseService {
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

    const terminal = await ppp.app.openTerminal();

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
        await fetch(this.getSQLUrl(`${this.document.type}/${action}.sql`))
      ).text(),
      {}
    );

    return this.executeSQL({
      api: this.document.supabaseApi,
      query
    });
  }

  async restart() {
    return this.action('start');
  }

  async stop() {
    return this.action('stop');
  }

  async cleanup() {
    return this.action('cleanup');
  }
}
