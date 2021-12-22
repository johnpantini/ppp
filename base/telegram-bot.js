import { BasePage } from '../lib/page/page.js';
import { validate, invalidate } from '../lib/validate.js';
import { generateIV, bufferToString, uuidv4 } from '../lib/ppp-crypto.js';

await i18nImport(['validation', 'new-telegram-bot']);

export async function checkTelegramBotToken({ token }) {
  try {
    return await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      cache: 'no-cache'
    });
  } catch (e) {
    console.error(e);

    return {
      ok: false,
      status: 422
    };
  }
}

export class TelegramBotPage extends BasePage {
  async addTelegramBot() {
    try {
      this.busy = true;
      this.app.toast.visible = false;
      this.app.toast.source = this;
      this.toastTitle = i18n.t('$pages.newTelegramBot.toast.title');

      await validate(this.profileName);
      await validate(this.botToken);

      const r1 = await checkTelegramBotToken({
        token: this.botToken.value.trim()
      });

      if (!r1.ok) {
        console.warn(await r1.text());

        invalidate(this.botToken, {
          errorMessage: i18n.t('invalidTokenWithStatus', r1),
          status: r1.status
        });
      }

      const iv = generateIV();
      const encryptedToken = await this.app.ppp.crypto.encrypt(
        iv,
        this.botToken.value.trim()
      );

      await this.app.ppp.user.functions.insertOne(
        {
          collection: 'bots'
        },
        {
          _id: this.profileName.value.trim(),
          uuid: uuidv4(),
          type: 'telegram',
          iv: bufferToString(iv),
          token: encryptedToken,
          created_at: new Date()
        }
      );

      this.app.toast.appearance = 'success';
      this.app.toast.dismissible = true;
      this.toastText = i18n.t('operationDone');
      this.app.toast.visible = true;
    } catch (e) {
      console.error(e);

      if (/E11000/i.test(e.error)) {
        invalidate(this.app.toast, {
          errorMessage: 'Профиль с таким названием уже существует'
        });
      } else {
        invalidate(this.app.toast, {
          errorMessage: i18n.t('operationFailed')
        });
      }
    } finally {
      this.busy = false;
    }
  }
}
