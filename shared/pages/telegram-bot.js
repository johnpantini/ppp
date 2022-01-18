/** @decorator */

import { BasePage } from '../page.js';
import { invalidate, validate } from '../validate.js'
import { generateIV, bufferToString } from '../ppp-crypto.js';
import { Observable, observable } from '../element/observation/observable.js';
import { maybeFetchError } from '../fetch-error.js';

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

    const botId = this.app.params()?.bot;

    if (botId) {
      this.beginOperation();

      try {
        this.bot = await this.app.ppp.user.functions.findOne(
          {
            collection: 'bots'
          },
          {
            _id: botId
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

      const rNewBot = await checkTelegramBotToken({
        token: this.botToken.value.trim()
      });

      if (!rNewBot.ok) {
        invalidate(this.botToken, {
          errorMessage: 'Неверный токен',
          silent: true
        });

        await maybeFetchError(rNewBot);
      }

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
              name: this.botName.value.trim(),
              version: 1,
              iv: bufferToString(iv),
              token: encryptedToken,
              type: 'telegram',
              updatedAt: new Date()
            }
          }
        );
      } else {
        await this.app.ppp.user.functions.insertOne(
          {
            collection: 'bots'
          },
          {
            name: this.botName.value.trim(),
            version: 1,
            type: 'telegram',
            createdAt: new Date(),
            updatedAt: new Date(),
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
