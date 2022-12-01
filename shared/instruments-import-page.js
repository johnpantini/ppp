import { Page } from './page.js';
import { invalidate, validate } from './validate.js';
import { Tmpl } from './tmpl.js';
import { BROKERS } from './const.js';
import ppp from '../ppp.js';

export class InstrumentsImportPage extends Page {
  async save() {
    this.beginOperation('Импорт инструментов');

    try {
      if (this.optionSelector.value === 'code') {
        await validate(this.code);

        const code = await new Tmpl().render(this, this.code.value, {});

        await this.importArrayOfInstruments(new Function(code)());
      } else {
        await this.importArrayOfInstruments(
          await (
            await fetch(
              `${ppp.rootUrl}/instruments/${this.dictionary.value}.json`,
              {
                cache: 'no-cache'
              }
            )
          ).json()
        );
      }

      this.succeedOperation();
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }

  async importArrayOfInstruments(array = []) {
    if (!Array.isArray(array)) {
      invalidate(ppp.app.toast, {
        errorMessage: 'Поддерживается импорт только массивов данных.',
        raiseException: true
      });
    }

    for (const i of array) {
      if (
        !i.symbol ||
        !i.type ||
        !i.currency ||
        !i.minPriceIncrement ||
        !i.lot ||
        (i.broker?.indexOf(BROKERS.TINKOFF_INVEST_API) > -1 && !i.tinkoffFigi)
      ) {
        console.log(i);

        invalidate(ppp.app.toast, {
          errorMessage:
            'Некоторые инструменты в массиве данных не содержат обязательных полей.',
          raiseException: true
        });
      }
    }

    await ppp.user.functions.bulkWrite(
      {
        collection: 'instruments'
      },
      array.map((i) => {
        return {
          updateOne: {
            filter: {
              symbol: i.symbol
            },
            update: {
              $set: i
            },
            upsert: true
          }
        };
      }),
      {
        ordered: false
      }
    );

    const openRequest = indexedDB.open('ppp', 1);

    return new Promise((resolve, reject) => {
      openRequest.onupgradeneeded = () => {
        const db = openRequest.result;

        if (!db.objectStoreNames.contains('instruments')) {
          db.createObjectStore('instruments', { keyPath: 'symbol' });
        }

        db.onerror = (event) => {
          console.error(event.target.error);

          reject(
            new Error(
              'Не удалось сохранить инструмент в локальном хранилище во время импорта.'
            )
          );
        };
      };

      openRequest.onsuccess = () => {
        const db = openRequest.result;
        const tx = db.transaction('instruments', 'readwrite');
        const instruments = tx.objectStore('instruments');

        array.forEach((instrument) => instruments.put(instrument));

        tx.oncomplete = () => {
          resolve();
        };
      };
    });
  }
}
