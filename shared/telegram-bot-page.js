import { Page } from './page.js';
import { invalidate, validate } from './validate.js';
import { TelegramBot, checkTelegramBotToken } from './telegram.js';
import { maybeFetchError } from './fetch-error.js';
import ppp from '../ppp.js';

export class TelegramBotPage extends Page {
  collection = 'bots';

  async setWebhookUrlByEndpoint() {
    const datum = this.endpointSelector.datum();

    if (!datum) {
      invalidate(this.endpointSelector, {
        errorMessage: 'Сначала выберите конечную точку',
        skipScrollIntoView: true
      });
    } else {
      this.webhook.state = 'default';
      this.webhook.value =
        ppp.keyVault
          .getKey('mongo-location-url')
          .replace('aws.stitch.mongodb', 'aws.data.mongodb-api') +
        `/app/${ppp.keyVault.getKey(
          'mongo-app-client-id'
        )}/endpoint${datum.value}`;
    }
  }

  async validate() {
    await validate(this.name);
    await validate(this.token);

    if (
      !(
        await checkTelegramBotToken({
          token: this.token.value.trim()
        })
      ).ok
    ) {
      invalidate(this.token, {
        errorMessage: 'Неверный токен',
        raiseException: true
      });
    }

    const webhook = this.webhook.value.trim();

    if (webhook) {
      try {
        new URL(webhook);
      } catch (e) {
        invalidate(this.webhook, {
          errorMessage: 'Неверный или неполный URL',
          raiseException: true
        });
      }
    }
  }

  async read() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.page.view.collection%]')
        .findOne({
          _id: new BSON.ObjectId('[%#payload.documentId%]')
        });
    };
  }

  async find() {
    return {
      name: this.name.value.trim()
    };
  }

  async update() {
    const token = this.token.value.trim();
    const webhook = this.webhook.value.trim();
    const telegramBot = new TelegramBot({
      token
    });

    if (this.webhook.value) {
      await maybeFetchError(
        await telegramBot.setWebhook(new URL(this.webhook.value).toString()),
        'Ошибка установки webhook.'
      );
    } else {
      await maybeFetchError(
        await telegramBot.deleteWebhook(),
        'Ошибка удаления webhook.'
      );
    }

    return {
      $set: {
        name: this.name.value.trim(),
        token,
        webhook,
        version: 1,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };
  }
}
