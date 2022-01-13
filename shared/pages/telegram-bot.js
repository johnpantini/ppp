/** @decorator */

import { BasePage } from '../page.js';
import { validate } from '../validate.js';
import { FetchError } from '../fetch-error.js';
import { generateIV, uuidv4, bufferToString } from '../ppp-crypto.js';
import { Observable, observable } from '../element/observation/observable.js';

export async function checkTelegramBotToken({ token }) {
  return fetch(`https://api.telegram.org/bot${token}/getMe`, {
    cache: 'no-cache'
  });
}

export class TelegramBotPage extends BasePage {
  @observable
  bot;

  async connectedCallback() {
    super.connectedCallback();

    const bot = this.app.params()?.bot;

    if (bot) {
      this.beginOperation();

      try {
        this.bot = await this.app.ppp.user.functions.findOne(
          {
            collection: 'bots'
          },
          {
            uuid: bot
          }
        );

        if (!this.bot) {
          this.failOperation(404);
        } else {
          this.bot.token = await this.app.ppp.crypto.decrypt(
            this.bot.iv,
            this.bot.token
          );

          Observable.notify(this, 'bot');
        }
      } catch (e) {
        this.failOperation(e);
      } finally {
        this.endOperation();
      }
    }
  }

  async addTelegramBot() {
    this.beginOperation();

    try {
      await validate(this.botName);
      await validate(this.botToken);

      const r1 = await checkTelegramBotToken({
        token: this.botToken.value.trim()
      });

      if (!r1.ok)
        // noinspection ExceptionCaughtLocallyJS
        throw new FetchError({ ...r1, ...{ message: await r1.text() } });

      const iv = generateIV();
      const encryptedToken = await this.app.ppp.crypto.encrypt(
        iv,
        this.botToken.value.trim()
      );

      if (this.bot) {
        await this.app.ppp.user.functions.updateOne(
          {
            collection: 'bots'
          },
          {
            _id: this.bot._id
          },
          {
            $set: {
              version: 1,
              iv: bufferToString(iv),
              token: encryptedToken,
              type: 'telegram',
              updated_at: new Date()
            }
          }
        );
      } else {
        await this.app.ppp.user.functions.insertOne(
          {
            collection: 'bots'
          },
          {
            _id: this.botName.value.trim(),
            version: 1,
            uuid: uuidv4(),
            type: 'telegram',
            created_at: new Date(),
            updated_at: new Date(),
            iv: bufferToString(iv),
            token: encryptedToken
          }
        );
      }

      this.succeedOperation();
    } catch (e) {
      this.failOperation(e);
    } finally {
      this.endOperation();
    }
  }
}
