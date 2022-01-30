import { PageWithTable } from '../page.js';
import { requireComponent } from '../template.js';
import { validate, invalidate, ValidationError } from '../validate.js';
import { Observable } from '../element/observation/observable.js';

export class ExtensionsPage extends PageWithTable {
  columns = [
    {
      label: 'Название',
      sortBy: (d) => d.title
    },
    {
      label: 'Автор',
      sortBy: (d) => d.author
    },
    {
      label: 'Дата добавления',
      sortBy: (d) => d.createdAt
    },
    {
      label: 'Последнее изменение',
      sortBy: (d) => d.createdAt
    },
    {
      label: 'Версия',
      sortBy: (d) => d.version
    },
    {
      label: 'Действия'
    }
  ];

  async handleNewExtensionClick() {
    await requireComponent('ppp-modal');

    this.newExtensionModal.visible = true;
  }

  async addExtension() {
    this.beginOperation(this.modalHeader.textContent.trim());

    try {
      this.newExtensionModal.visibleChanged = (oldValue, newValue) =>
        !newValue && (this.app.toast.visible = false);

      await validate(this.manifestUrl);

      let url;

      try {
        if (this.manifestUrl.value.startsWith('/')) {
          const rootUrl = window.location.origin;

          if (rootUrl.endsWith('.github.io'))
            url = new URL('/ppp' + this.manifestUrl.value, rootUrl);
          else url = new URL(this.manifestUrl.value, rootUrl);
        } else {
          url = new URL(this.manifestUrl.value);
        }

        if (!url.pathname.endsWith('/ppp.json')) {
          // noinspection ExceptionCaughtLocallyJS
          throw new ValidationError();
        }
      } catch (e) {
        invalidate(this.manifestUrl, {
          errorMessage: 'Неверный URL.'
        });
      }

      try {
        const manifest = await (
          await fetch(url.toString(), {
            cache: 'no-cache'
          })
        ).json();

        if (
          !manifest.page.trim() ||
          !manifest.title.trim() ||
          !manifest.author.trim() ||
          isNaN(manifest.version) ||
          parseInt(manifest.version) < 1
        ) {
          // noinspection ExceptionCaughtLocallyJS
          throw new ValidationError();
        }

        const title = this.extensionTitle.value.trim() || manifest.title.trim();
        const payload = {
          url: url.toString(),
          title,
          repository: manifest.repository,
          page: manifest.page.trim(),
          author: manifest.author.trim(),
          version: manifest.version,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const { insertedId } = await this.app.ppp.user.functions.insertOne(
          {
            collection: 'extensions'
          },
          payload
        );

        payload._id = insertedId;

        this.app.extensions.push(payload);
        Observable.notify(this.app, 'extensions');

        this.succeedOperation();
      } catch (e) {
        console.log(e);

        invalidate(this.app.toast, {
          errorMessage: 'Манифест непригоден для использования.'
        });
      }
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async data() {
    return await this.app.ppp.user.functions.aggregate(
      {
        collection: 'extensions'
      },
      [
        {
          $match: {
            removed: { $not: { $eq: true } }
          }
        }
      ]
    );
  }
}
