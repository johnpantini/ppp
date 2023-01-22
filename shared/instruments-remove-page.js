import { Page } from './page.js';
import ppp from '../ppp.js';

export class InstrumentsRemovePage extends Page {
  async save() {
    this.beginOperation('Удаление инструментов');

    try {
      const filter = {
        type: {
          $in: this.typeCheckboxes.filter((c) => c.checked).map((c) => c.name)
        },
        exchange: {
          $in: this.exchangeCheckboxes
            .filter((c) => c.checked)
            .map((c) => c.name)
        },
        broker: {
          $in: this.brokerCheckboxes.filter((c) => c.checked).map((c) => c.name)
        }
      };

      await ppp.user.functions.updateMany(
        {
          collection: 'instruments'
        },
        filter,
        {
          $set: {
            removed: true
          }
        },
        {
          upsert: true
        }
      );

      this.succeedOperation();
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}
